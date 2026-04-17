// server/src/services/nlp/textToWorkflow.service.js
// Phase-2: Platform-constrained workflow generation with catalog validation
// Production-grade: Constraint-driven planning engine (not a chatbot wrapper)

import Groq from 'groq-sdk';
import { buildSystemPrompt, buildRetrySystemPrompt } from './promptTemplates.js';
import {
  getNodeLabelsWithTypes,
  getRelevantNodeLabelsWithTypes,
  validateNodesAgainstCatalog,
  getCatalogVersion
} from '../../domains/platform/platform.service.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { getCachedWorkflow, setCachedWorkflow } from './promptCache.js';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error('FATAL ERROR: GROQ_API_KEY is not defined in environment variables.');
}

const groq = new Groq({ apiKey });

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const MAX_COMPLETION_TOKENS = parseEnvInt('GROQ_MAX_COMPLETION_TOKENS', 700, 128, 2000);
const PROMPT_NODE_LIMIT = parseEnvInt('NLP_PROMPT_NODE_LIMIT', 28, 8, 120);
const RETRY_PROMPT_NODE_LIMIT = parseEnvInt('NLP_RETRY_PROMPT_NODE_LIMIT', 48, 12, 160);
const EMPTY_RESPONSE_RECOVERY_ATTEMPTS = 2;
const EMPTY_RESPONSE_RECOVERY_NODE_LIMIT = parseEnvInt('NLP_EMPTY_RESPONSE_NODE_LIMIT', 16, 8, 48);
const EMPTY_RESPONSE_RECOVERY_MAX_TOKENS = parseEnvInt(
  'NLP_EMPTY_RESPONSE_MAX_TOKENS',
  Math.min(Math.max(MAX_COMPLETION_TOKENS + 500, 900), 1800),
  256,
  2000
);
const MALFORMED_RETRY_ATTEMPTS = 2;
const EMPTY_AI_RESPONSE_ERROR = 'EMPTY_AI_RESPONSE';

function parseEnvInt(envKey, fallback, min, max) {
  const rawValue = process.env[envKey];
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Sleep utility for exponential backoff
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is a rate limit (429) error
 */
function isRateLimitError(error) {
  const status = error?.status || error?.response?.status;
  const message = String(error?.message || '').toLowerCase();

  return status === 429 ||
    status === 413 ||
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('rate_limit_exceeded') ||
    message.includes('tokens per minute') ||
    message.includes('too many requests');
}

function normalizeContentValue(value) {
  if (typeof value === 'string') return value.trim();

  if (Array.isArray(value)) {
    return value
      .map(part => {
        if (typeof part === 'string') return part;
        if (!part || typeof part !== 'object') return '';

        if (typeof part.text === 'string') return part.text;
        if (typeof part.content === 'string') return part.content;

        if (Array.isArray(part.content)) {
          return normalizeContentValue(part.content);
        }

        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  if (value && typeof value === 'object') {
    if (typeof value.text === 'string') return value.text.trim();
    if (typeof value.content === 'string') return value.content.trim();
  }

  return '';
}

function extractAssistantResponseText(completion) {
  const choice = completion?.choices?.[0];
  if (!choice) {
    throw new Error(`${EMPTY_AI_RESPONSE_ERROR}:no_choice`);
  }

  const message = choice.message || {};

  const messageContent = normalizeContentValue(message.content);
  if (messageContent) {
    return messageContent;
  }

  const functionArgs = message?.function_call?.arguments;
  if (typeof functionArgs === 'string' && functionArgs.trim()) {
    return functionArgs.trim();
  }

  if (Array.isArray(message?.tool_calls)) {
    for (const toolCall of message.tool_calls) {
      const args = toolCall?.function?.arguments;
      if (typeof args === 'string' && args.trim()) {
        return args.trim();
      }
    }
  }

  if (typeof choice?.text === 'string' && choice.text.trim()) {
    return choice.text.trim();
  }

  const finishReason = choice?.finish_reason || 'unknown';
  throw new Error(`${EMPTY_AI_RESPONSE_ERROR}:${finishReason}`);
}

// ── JSON Extraction & Repair Utilities ──

function extractWorkflowJSON(response) {
  if (!response || typeof response !== 'string') {
    throw new Error('AI response is empty');
  }

  let content = response.trim();

  // Prefer explicit delimiters
  const delimMatch = content.match(/<<<JSON>>>([\s\S]*?)<<<END_JSON>>>/i);
  if (delimMatch && delimMatch[1]) {
    content = delimMatch[1].trim();
  }

  // Remove code fences
  content = content.replace(/```json|```/gi, '');
  content = content.replace(/Respond only with the JSON object[:\s]*/i, '');
  content = content.trim();

  // Lightweight cleanup: trailing commas
  content = content.replace(/,\s*(?=[}\]])/g, '');

  // Fix unterminated quotes
  content = closeOpenQuotes(content);

  // Auto-balance braces
  content = autoBalanceBrackets(content);

  // Find JSON object
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error('Failed to parse JSON from AI response: ' + err.message);
  }
}

function autoBalanceBrackets(text) {
  const openers = { '{': '}', '[': ']' };
  const stack = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{' || ch === '[') stack.push(openers[ch]);
    else if (ch === '}' || ch === ']') {
      if (stack.length && stack[stack.length - 1] === ch) stack.pop();
    }
  }
  if (stack.length) {
    return text + stack.reverse().join('');
  }
  return text;
}

function closeOpenQuotes(text) {
  if (typeof text !== 'string') return text;
  const withoutEscaped = text.replace(/\\"/g, '');
  const quoteCount = (withoutEscaped.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (lastBrace > -1) {
      return text.slice(0, lastBrace) + '"' + text.slice(lastBrace);
    }
    return text + '"';
  }
  return text;
}

function enhancedLocalJSONRepair(rawResponse) {
  let content = rawResponse;

  const delimMatch = content.match(/<<<JSON>>>([\s\S]*?)<<<END_JSON>>>/i);
  if (delimMatch && delimMatch[1]) {
    content = delimMatch[1];
  }

  content = content.replace(/```json\s*/gi, '');
  content = content.replace(/```\s*/gi, '');

  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    content = content.slice(firstBrace, lastBrace + 1);
  }

  content = content.replace(/,\s*(?=[}\]])/g, '');
  content = closeOpenQuotes(content);
  content = autoBalanceBrackets(content);

  const finalBrace = content.lastIndexOf('}');
  if (finalBrace > 0) {
    content = content.slice(0, finalBrace + 1);
  }

  return content.trim();
}

// ── Workflow Structure Validation ──

function validateWorkflowStructure(workflow) {
  if (!workflow || typeof workflow !== 'object') throw new Error('Workflow must be an object');
  if (!Array.isArray(workflow.nodes)) throw new Error('Workflow must have a "nodes" array');
  if (!Array.isArray(workflow.edges)) throw new Error('Workflow must have an "edges" array');
  if (workflow.nodes.length === 0) throw new Error('Workflow must have at least one node');

  workflow.nodes.forEach((node, i) => {
    if (!node.id) throw new Error(`Node at index ${i} is missing required field: id`);
    if (!node.label || typeof node.label !== 'string') {
      throw new Error(`Node ${node.id || i} is missing required field: label (must be a string)`);
    }
  });

  workflow.edges.forEach((edge, i) => {
    if (!edge.source) throw new Error(`Edge at index ${i} is missing required field: source`);
    if (!edge.target) throw new Error(`Edge at index ${i} is missing required field: target`);
    const sourceExists = workflow.nodes.some(n => n.id === edge.source);
    const targetExists = workflow.nodes.some(n => n.id === edge.target);
    if (!sourceExists) throw new Error(`Edge references non-existent source node: ${edge.source}`);
    if (!targetExists) throw new Error(`Edge references non-existent target node: ${edge.target}`);
  });

  return true;
}

// ── Post-Generation Catalog Validation ──

/**
 * Validates every node label against the platform catalog.
 * Uses strict fuzzy matching (>90% similarity) for correction.
 *
 * @param {Object} workflow - Parsed workflow JSON
 * @param {string} platform - Platform identifier
 * @returns {{ valid: boolean, invalidNodes: string[], corrections: {}, error?: string }}
 */
function validateAgainstCatalog(workflow, platform) {
  const nodeLabels = workflow.nodes.map(n => n.label);

  for (let i = 0; i < nodeLabels.length; i++) {
    if (typeof nodeLabels[i] !== 'string') {
      console.warn(`⚠️ [Validation] Node at index ${i} has non-string label: ${typeof nodeLabels[i]}`);
      return {
        valid: false,
        invalidNodes: [`Node ${i}: non-string label`],
        corrections: {},
        error: `Node at index ${i} has a non-string label`
      };
    }
  }

  return validateNodesAgainstCatalog(platform, nodeLabels);
}

/**
 * Apply fuzzy corrections to workflow nodes.
 * Logs each correction transparently.
 */
function applyCorrections(workflow, corrections) {
  if (!corrections || Object.keys(corrections).length === 0) return;

  workflow.nodes.forEach(node => {
    if (corrections[node.label]) {
      const original = node.label;
      node.label = corrections[original];
      console.log(`🔧 [Correction] "${original}" → "${node.label}"`);
    }
  });
}

function isTriggerLikeLabel(label) {
  const normalized = String(label || '').toLowerCase();
  return normalized.includes('trigger') ||
    normalized.includes('schedule') ||
    normalized.includes('cron') ||
    normalized.includes('webhook');
}

function isSummaryIntent(userPrompt) {
  const prompt = String(userPrompt || '').toLowerCase();
  return /\bsummar(y|ize|ise|ies|ized|ised|izing|ising)\b/.test(prompt) ||
    prompt.includes('digest') ||
    prompt.includes('recap');
}

function sortNodesByLikelyFlow(nodes) {
  return [...nodes]
    .map((node, index) => ({ node, index }))
    .sort((a, b) => {
      const aId = Number.parseInt(String(a.node?.id ?? ''), 10);
      const bId = Number.parseInt(String(b.node?.id ?? ''), 10);
      const aSortable = Number.isNaN(aId) ? Number.POSITIVE_INFINITY : aId;
      const bSortable = Number.isNaN(bId) ? Number.POSITIVE_INFINITY : bId;

      if (aSortable !== bSortable) return aSortable - bSortable;
      return a.index - b.index;
    })
    .map(entry => entry.node);
}

function sanitizeEdges(nodes, edges) {
  const nodeIdSet = new Set(nodes.map(node => String(node.id)));
  const dedup = new Set();
  const sanitized = [];

  for (const rawEdge of Array.isArray(edges) ? edges : []) {
    const source = String(rawEdge?.source ?? '');
    const target = String(rawEdge?.target ?? '');

    if (!nodeIdSet.has(source) || !nodeIdSet.has(target) || source === target) continue;

    const key = `${source}->${target}`;
    if (dedup.has(key)) continue;

    dedup.add(key);
    sanitized.push({ ...rawEdge, source, target });
  }

  return sanitized;
}

function buildAdjacency(edges) {
  const adjacency = new Map();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    adjacency.get(edge.source).add(edge.target);
  }
  return adjacency;
}

function hasDirectedPath(adjacency, start, target) {
  if (start === target) return true;

  const stack = [start];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === target) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current);
    if (!neighbors) continue;
    for (const next of neighbors) {
      if (!visited.has(next)) stack.push(next);
    }
  }

  return false;
}

function addEdgeIfSafe(edges, adjacency, source, target) {
  if (!source || !target || source === target) return false;

  const alreadyExists = edges.some(edge => edge.source === source && edge.target === target);
  if (alreadyExists) return false;

  // Do not create a cycle.
  if (hasDirectedPath(adjacency, target, source)) return false;

  edges.push({ source, target, type: 'step' });

  if (!adjacency.has(source)) adjacency.set(source, new Set());
  adjacency.get(source).add(target);

  return true;
}

function repairWorkflowConnectivity(workflow) {
  if (!workflow || !Array.isArray(workflow.nodes) || workflow.nodes.length <= 1) return;

  const orderedNodes = sortNodesByLikelyFlow(workflow.nodes);
  const triggerNode = orderedNodes.find(node => isTriggerLikeLabel(node.label)) || orderedNodes[0];
  const triggerId = String(triggerNode.id);

  const repairedEdges = sanitizeEdges(orderedNodes, workflow.edges);
  const adjacency = buildAdjacency(repairedEdges);

  const incomingCounts = new Map(orderedNodes.map(node => [String(node.id), 0]));
  for (const edge of repairedEdges) {
    incomingCounts.set(edge.target, (incomingCounts.get(edge.target) || 0) + 1);
  }

  for (let i = 0; i < orderedNodes.length; i++) {
    const currentId = String(orderedNodes[i].id);
    if (currentId === triggerId) continue;
    if ((incomingCounts.get(currentId) || 0) > 0) continue;

    let sourceId = null;
    for (let j = i - 1; j >= 0; j--) {
      const candidateId = String(orderedNodes[j].id);
      if (candidateId === currentId) continue;
      if (hasDirectedPath(adjacency, currentId, candidateId)) continue;
      sourceId = candidateId;
      break;
    }

    if (!sourceId) {
      sourceId = triggerId;
      if (sourceId === currentId || hasDirectedPath(adjacency, currentId, sourceId)) {
        continue;
      }
    }

    if (addEdgeIfSafe(repairedEdges, adjacency, sourceId, currentId)) {
      incomingCounts.set(currentId, (incomingCounts.get(currentId) || 0) + 1);
      console.log(`🔗 [Repair] Added missing edge ${sourceId} -> ${currentId}`);
    }
  }

  workflow.edges = repairedEdges.map((edge, index) => ({
    id: edge.id || `edge-${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'step'
  }));
}

function enrichSummaryNodeDescription(workflow, userPrompt) {
  if (!isSummaryIntent(userPrompt) || !Array.isArray(workflow?.nodes)) return;

  const summaryNode = workflow.nodes.find(node => {
    const label = String(node?.label || '').toLowerCase();
    return label.includes('summar') ||
      label.includes('openai') ||
      label.includes('ai transform') ||
      label.includes('text') ||
      label === 'set';
  });

  if (!summaryNode) return;

  const currentDescription = String(summaryNode?.data?.description || '').toLowerCase();
  const shouldRewrite = !currentDescription ||
    currentDescription.includes('placeholder') ||
    currentDescription.includes('processes');

  if (!shouldRewrite) return;

  summaryNode.data = {
    ...(summaryNode.data || {}),
    description: 'Summarizes the fetched emails into a concise daily digest message.'
  };
}

function postProcessWorkflow(workflow, userPrompt) {
  repairWorkflowConnectivity(workflow);
  enrichSummaryNodeDescription(workflow, userPrompt);
}

// ── Workflow Enhancement ──

function enhanceWorkflow(workflow, userPrompt, platform) {
  const catalogVersion = getCatalogVersion(platform);
  return {
    ...workflow,
    metadata: {
      generatedFrom: userPrompt,
      generatedAt: new Date().toISOString(),
      version: '2.0',
      aiProvider: 'groq',
      platform: platform,
      catalogVersion: catalogVersion
    }
  };
}

// ── Fallback Workflow ──

function getCatalogLabelMap(platform) {
  const labelMap = new Map();
  const nodesWithTypes = getNodeLabelsWithTypes(platform);

  for (const node of nodesWithTypes) {
    if (!node?.label) continue;
    labelMap.set(node.label.toLowerCase(), node.label);
  }

  return labelMap;
}

function pickCatalogLabel(labelMap, candidates, fallback) {
  for (const candidate of candidates) {
    const matched = labelMap.get(String(candidate).toLowerCase());
    if (matched) return matched;
  }
  return fallback;
}

function extractPromptContext(userPrompt) {
  const prompt = String(userPrompt || '');
  const lower = prompt.toLowerCase();

  const emailMatches = [...prompt.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)]
    .map(match => match[0]);

  const quotedMatches = [...prompt.matchAll(/["'“”‘’]([^"'“”‘’]{2,80})["'“”‘’]/g)]
    .map(match => match[1]?.trim())
    .filter(Boolean);

  const senderHint = quotedMatches.find(entry => !entry.includes('@')) || '';
  const groupHint = emailMatches[0] || '';

  return {
    wantsDaily: lower.includes('every day') || lower.includes('daily') || lower.includes('each day'),
    wantsEmailScan: lower.includes('mail') || lower.includes('email') || lower.includes('gmail'),
    wantsSummary: isSummaryIntent(prompt),
    wantsWhatsApp: lower.includes('whatsapp') || lower.includes('whats app') || lower.includes('wa '),
    senderHint,
    groupHint
  };
}

function generateFallbackWorkflow(userPrompt, platform, fallbackReason = 'AI request could not be completed') {
  console.log(`⚠️ Using fallback workflow generator (${fallbackReason})`);

  const context = extractPromptContext(userPrompt);
  const labelMap = getCatalogLabelMap(platform);

  const triggerLabel = context.wantsDaily
    ? pickCatalogLabel(labelMap, ['Schedule Trigger', 'Cron', 'Interval'], 'Schedule Trigger')
    : pickCatalogLabel(labelMap, ['Manual Trigger', 'Webhook', 'Schedule Trigger'], 'Schedule Trigger');

  let fetchLabel = context.wantsEmailScan
    ? pickCatalogLabel(labelMap, ['Gmail', 'IMAP Email', 'HTTP Request', 'Gmail Trigger'], 'HTTP Request')
    : pickCatalogLabel(labelMap, ['HTTP Request', 'Webhook'], 'HTTP Request');

  // Keep trigger nodes at the start; avoid generating trigger-in-the-middle fallback chains.
  if (isTriggerLikeLabel(fetchLabel)) {
    fetchLabel = pickCatalogLabel(labelMap, ['Gmail', 'HTTP Request', 'Set'], 'HTTP Request');
  }

  const summaryLabel = context.wantsSummary
    ? pickCatalogLabel(labelMap, ['AI Transform', 'OpenAI', 'Set'], 'Set')
    : null;

  const deliveryLabel = context.wantsWhatsApp
    ? pickCatalogLabel(labelMap, ['WhatsApp Business Cloud', 'WhatsApp Trigger', 'Twilio'], 'WhatsApp Business Cloud')
    : null;

  const triggerDescription = context.wantsDaily
    ? 'Triggers workflow once every day to process new emails.'
    : 'Triggers workflow when the flow is started.';

  const fetchFilters = [
    context.senderHint ? `sender "${context.senderHint}"` : '',
    context.groupHint ? `group address "${context.groupHint}"` : ''
  ].filter(Boolean).join(' and ');

  const fetchDescription = context.wantsEmailScan
    ? `Fetches emails${fetchFilters ? ` filtered by ${fetchFilters}` : ''}.`
    : 'Fetches required source data for downstream processing.';

  const nodes = [
    {
      id: '1',
      label: triggerLabel,
      data: { description: triggerDescription }
    },
    {
      id: '2',
      label: fetchLabel,
      data: { description: fetchDescription }
    }
  ];

  if (summaryLabel) {
    nodes.push({
      id: String(nodes.length + 1),
      label: summaryLabel,
      data: { description: 'Summarizes the fetched emails into a concise daily digest.' }
    });
  }

  if (deliveryLabel) {
    nodes.push({
      id: String(nodes.length + 1),
      label: deliveryLabel,
      data: { description: 'Sends the generated summary to WhatsApp.' }
    });
  }

  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ source: nodes[i].id, target: nodes[i + 1].id });
  }

  return {
    nodes,
    edges,
    metadata: {
      generatedFrom: userPrompt,
      generatedAt: new Date().toISOString(),
      version: '2.0',
      aiProvider: 'fallback',
      platform: platform,
      catalogVersion: getCatalogVersion(platform),
      note: `Generated using fallback template because ${fallbackReason}. Please customize as needed.`
    }
  };
}

// ── Groq API Call with Retry ──

async function callGroqWithRetry(messages, modelId, maxRetries = MAX_RETRIES, requestOptions = {}) {
  let lastError = null;

  const temperature = Number.isFinite(requestOptions.temperature)
    ? requestOptions.temperature
    : 0.3;

  const topP = Number.isFinite(requestOptions.topP)
    ? requestOptions.topP
    : 0.9;

  const maxCompletionTokens = Number.isFinite(requestOptions.maxCompletionTokens)
    ? requestOptions.maxCompletionTokens
    : MAX_COMPLETION_TOKENS;

  const shortCircuitOnLength = requestOptions.shortCircuitOnLength === true;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Groq API call attempt ${attempt}/${maxRetries}`);

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: modelId,
        temperature: temperature,
        max_completion_tokens: maxCompletionTokens,
        top_p: topP,
        stream: false,
        stop: null
      });

      const assistantText = extractAssistantResponseText(completion);
      if (!assistantText) {
        throw new Error(`${EMPTY_AI_RESPONSE_ERROR}:blank`);
      }

      return assistantText;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);

      const errorMessage = String(error?.message || '');
      const isRateLimited = isRateLimitError(error);
      const isEmptyResponse = errorMessage.startsWith(EMPTY_AI_RESPONSE_ERROR);
      const isEmptyLengthResponse = isEmptyResponse && errorMessage.includes(':length');

      if (isEmptyLengthResponse && shortCircuitOnLength) {
        throw new Error(`${EMPTY_AI_RESPONSE_ERROR}:length`);
      }

      if (isRateLimited || isEmptyResponse) {
        if (attempt < maxRetries) {
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`⏳ Retrying after ${delay}ms (reason: ${isRateLimited ? 'rate limit' : 'empty response'})...`);
          await sleep(delay);
        } else {
          if (isRateLimited) {
            throw new Error('QUOTA_EXCEEDED');
          }

          throw new Error(isEmptyResponse ? errorMessage : EMPTY_AI_RESPONSE_ERROR);
        }
      } else {
        throw error;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// ── Parse and Validate Workflow from AI Response ──

function parseAndValidateWorkflow(aiResponse) {
  let workflow;
  try {
    workflow = extractWorkflowJSON(aiResponse);
    validateWorkflowStructure(workflow);
  } catch (parseErr) {
    const repairedContent = enhancedLocalJSONRepair(aiResponse);
    try {
      workflow = extractWorkflowJSON(repairedContent);
      validateWorkflowStructure(workflow);
    } catch (repairErr) {
      throw new Error(
        `Failed to parse workflow JSON. Extraction error: ${parseErr.message}. Repair error: ${repairErr.message}.`
      );
    }
  }
  return workflow;
}

function buildMalformedRecoveryMessages(userPrompt, platform, nodesWithTypes, malformedResponse) {
  const allowedNodesJSON = JSON.stringify(nodesWithTypes);
  const malformedSnippet = String(malformedResponse || '')
    .replace(/\s+/g, ' ')
    .slice(0, 1200);

  return [
    {
      role: 'system',
      content: `You are a workflow planner for the "${platform}" platform.

AllowedNodes (JSON Array):
${allowedNodesJSON}

Return ONLY a valid JSON object between <<<JSON>>> and <<<END_JSON>>>.
No markdown. No explanation. No extra keys.

JSON schema:
{
  "nodes": [
    { "id": "1", "label": "Exact Label from AllowedNodes", "data": { "description": "..." } }
  ],
  "edges": [
    { "source": "1", "target": "2" }
  ]
}

Rules:
- Use only labels from AllowedNodes.
- First node must be a trigger.
- Produce a connected DAG with no isolated nodes.`
    },
    {
      role: 'user',
      content: `Your previous response was malformed and could not be parsed as JSON.

User Request: "${userPrompt}"

Malformed previous response (for context only, do not repeat):
"""
${malformedSnippet || '[empty response]'}
"""

Regenerate from scratch and return valid JSON only.`
    }
  ];
}

async function parseWorkflowWithRecovery(options) {
  const {
    aiResponse,
    userPrompt,
    platform,
    requestedModel,
    nodesWithTypes,
    attemptLabel
  } = options;

  try {
    const workflow = parseAndValidateWorkflow(aiResponse);
    return { workflow, response: aiResponse, recovered: false };
  } catch (parseError) {
    console.warn(`⚠️ [Parse] ${attemptLabel} response malformed: ${parseError.message}`);

    const recoveryMessages = buildMalformedRecoveryMessages(
      userPrompt,
      platform,
      nodesWithTypes,
      aiResponse
    );

    const recoveredResponse = await callGroqWithRetry(
      recoveryMessages,
      requestedModel,
      MALFORMED_RETRY_ATTEMPTS,
      {
        temperature: 0.1,
        topP: 0.8
      }
    );

    const recoveredWorkflow = parseAndValidateWorkflow(recoveredResponse);
    console.log(`✅ [Parse Recovery] ${attemptLabel} response recovered via strict regeneration`);

    return {
      workflow: recoveredWorkflow,
      response: recoveredResponse,
      recovered: true
    };
  }
}

async function recoverFromEmptyAIResponse(options) {
  const {
    userPrompt,
    platform,
    requestedModel,
    nodesWithTypes
  } = options;

  const compactNodesWithTypes = getRelevantNodeLabelsWithTypes(platform, userPrompt, {
    maxNodes: EMPTY_RESPONSE_RECOVERY_NODE_LIMIT,
    minScore: 1
  });

  const recoveryNodes = compactNodesWithTypes.length > 0
    ? compactNodesWithTypes
    : nodesWithTypes.slice(0, EMPTY_RESPONSE_RECOVERY_NODE_LIMIT);

  const recoveryMessages = buildMalformedRecoveryMessages(
    userPrompt,
    platform,
    recoveryNodes,
    '[empty response from model]'
  );

  return callGroqWithRetry(
    recoveryMessages,
    requestedModel,
    EMPTY_RESPONSE_RECOVERY_ATTEMPTS,
    {
      temperature: 0.05,
      topP: 0.7,
      maxCompletionTokens: EMPTY_RESPONSE_RECOVERY_MAX_TOKENS
    }
  );
}

// ── Main Generation Function ──

async function generateWorkflowFromText(userPrompt, options = {}) {
  const startTime = Date.now();
  let aiResponse = '';
  const requestedModel = options.model || 'openai/gpt-oss-20b';
  const platform = options.platform || 'n8n';

  try {
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      throw new Error('Prompt must be a non-empty string');
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured in environment variables');
    }

    // Check cache first
    const cacheKey = `${platform}:${userPrompt}`;
    const cachedResult = getCachedWorkflow(cacheKey, requestedModel);
    if (cachedResult) {
      console.log('🎯 Returning cached workflow result');
      return {
        ...cachedResult,
        cached: true,
        executionTime: `${Date.now() - startTime}ms`
      };
    }

    // ── Load platform catalog with types ──
    const allNodesWithTypes = getNodeLabelsWithTypes(platform);
    if (allNodesWithTypes.length === 0) {
      throw new Error(`Platform catalog for "${platform}" is unavailable`);
    }

    const relevantNodesWithTypes = getRelevantNodeLabelsWithTypes(platform, userPrompt, {
      maxNodes: PROMPT_NODE_LIMIT,
      minScore: 2
    });

    const constrainedNodesWithTypes = relevantNodesWithTypes.length > 0
      ? relevantNodesWithTypes
      : allNodesWithTypes.slice(0, PROMPT_NODE_LIMIT);

    console.log(
      `📋 [Platform] Injecting ${constrainedNodesWithTypes.length}/${allNodesWithTypes.length} relevant nodes for "${platform}"`
    );

    // Build structured system prompt with catalog injection
    const systemPrompt = buildSystemPrompt(constrainedNodesWithTypes, platform);

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Convert this user request into a workflow JSON for the "${platform}" platform:\n\nUser Request: "${userPrompt}"\n\nYour JSON Response:`
      }
    ];

    // ── First Attempt ──
    try {
      aiResponse = await callGroqWithRetry(messages, requestedModel, MAX_RETRIES, {
        shortCircuitOnLength: true
      });
    } catch (error) {
      const errorMessage = String(error?.message || '');

      if (errorMessage === 'QUOTA_EXCEEDED') {
        return buildQuotaExceededResult(userPrompt, platform, startTime);
      }

      if (errorMessage.startsWith(EMPTY_AI_RESPONSE_ERROR)) {
        console.warn('⚠️ [Recovery] Empty model output detected. Retrying with compact strict request...');

        try {
          aiResponse = await recoverFromEmptyAIResponse({
            userPrompt,
            platform,
            requestedModel,
            nodesWithTypes: constrainedNodesWithTypes
          });

          console.log('✅ [Recovery] Empty response recovered with compact strict regeneration');
        } catch (emptyRecoveryError) {
          const recoveryMessage = String(emptyRecoveryError?.message || '');

          if (recoveryMessage === 'QUOTA_EXCEEDED') {
            return buildQuotaExceededResult(userPrompt, platform, startTime);
          }

          if (recoveryMessage.startsWith(EMPTY_AI_RESPONSE_ERROR)) {
            return buildEmptyResponseFallbackResult(userPrompt, platform, startTime);
          }

          throw emptyRecoveryError;
        }

      } else {
        throw error;
      }
    }

    // ── Parse and Validate ──
    let workflow;
    try {
      const initialParse = await parseWorkflowWithRecovery({
        aiResponse,
        userPrompt,
        platform,
        requestedModel,
        nodesWithTypes: constrainedNodesWithTypes,
        attemptLabel: 'initial'
      });

      workflow = initialParse.workflow;
      aiResponse = initialParse.response;
    } catch (parseError) {
      console.warn('⚠️ Falling back due to malformed AI response:', parseError.message);
      return buildMalformedResponseFallbackResult(userPrompt, platform, startTime, parseError.message, aiResponse);
    }

    // ── Catalog Validation ──
    let catalogValidation = validateAgainstCatalog(workflow, platform);

    // Apply corrections if valid (fuzzy-matched labels)
    if (catalogValidation.valid) {
      applyCorrections(workflow, catalogValidation.corrections);
    }

    // ── Step 6: Smart Single-Retry on Hallucination ──
    if (!catalogValidation.valid) {
      console.warn(`⚠️ [Retry] First attempt had ${catalogValidation.invalidNodes.length} hallucinated nodes. Retrying with stricter prompt...`);

      // Build stricter system prompt listing the invalid nodes
      const retryRelevantNodesWithTypes = getRelevantNodeLabelsWithTypes(
        platform,
        `${userPrompt} ${catalogValidation.invalidNodes.join(' ')}`,
        {
          maxNodes: RETRY_PROMPT_NODE_LIMIT,
          minScore: 1
        }
      );

      const retryNodeSubset = retryRelevantNodesWithTypes.length > 0
        ? retryRelevantNodesWithTypes
        : allNodesWithTypes.slice(0, RETRY_PROMPT_NODE_LIMIT);

      const retrySystemPrompt = buildRetrySystemPrompt(
        catalogValidation.invalidNodes,
        retryNodeSubset,
        platform
      );

      const retryMessages = [
        {
          role: "system",
          content: retrySystemPrompt
        },
        {
          role: "user",
          content: `Convert this user request into a workflow JSON for the "${platform}" platform:\n\nUser Request: "${userPrompt}"\n\nYour JSON Response:`
        }
      ];

      try {
        const retryResponse = await callGroqWithRetry(retryMessages, requestedModel);
        const retryParse = await parseWorkflowWithRecovery({
          aiResponse: retryResponse,
          userPrompt,
          platform,
          requestedModel,
          nodesWithTypes: retryNodeSubset,
          attemptLabel: 'catalog-validation-retry'
        });

        const retryWorkflow = retryParse.workflow;
        const retryValidation = validateAgainstCatalog(retryWorkflow, platform);

        if (retryValidation.valid) {
          console.log('✅ [Retry] Second attempt succeeded!');
          applyCorrections(retryWorkflow, retryValidation.corrections);
          workflow = retryWorkflow;
          catalogValidation = retryValidation;
        } else {
          // Second attempt also failed — reject cleanly
          const invalidList = retryValidation.invalidNodes.join(', ');
          console.error(`❌ [Retry] Second attempt also failed — hallucinated nodes: ${invalidList}`);

          return {
            success: false,
            error: `Workflow contains nodes not available in the ${platform} platform: ${invalidList}. AI failed to self-correct after retry.`,
            invalidNodes: retryValidation.invalidNodes,
            prompt: userPrompt,
            platform: platform,
            executionTime: `${Date.now() - startTime}ms`,
            aiProvider: 'groq',
            retryAttempted: true
          };
        }
      } catch (retryError) {
        console.error('❌ [Retry] Retry attempt failed:', retryError.message);
        // Fall through to reject with original invalid nodes
        const invalidList = catalogValidation.invalidNodes.join(', ');
        return {
          success: false,
          error: `Workflow contains hallucinated nodes: ${invalidList}. Retry failed: ${retryError.message}`,
          invalidNodes: catalogValidation.invalidNodes,
          prompt: userPrompt,
          platform: platform,
          executionTime: `${Date.now() - startTime}ms`,
          aiProvider: 'groq',
          retryAttempted: true
        };
      }
    }

    console.log(`✅ [Validation] All ${workflow.nodes.length} nodes validated against ${platform} catalog`);

    postProcessWorkflow(workflow, userPrompt);
    validateWorkflowStructure(workflow);

    const enhancedWorkflow = enhanceWorkflow(workflow, userPrompt, platform);
    const executionTime = Date.now() - startTime;

    const result = {
      success: true,
      workflow: enhancedWorkflow,
      prompt: userPrompt,
      platform: platform,
      executionTime: `${executionTime}ms`,
      aiProvider: 'groq',
      model: requestedModel,
      cost: '0.000000'
    };

    // Cache successful result
    setCachedWorkflow(cacheKey, requestedModel, result);

    return result;

  } catch (error) {
    console.error('Workflow generation failed:', error.message);
    if (aiResponse) console.error('Raw AI response on failure:', aiResponse);

    let resultErrorMessage = error.message;
    if (aiResponse && /INVALID_JSON/i.test(aiResponse)) {
      resultErrorMessage = 'AI could not produce valid JSON (model returned INVALID_JSON).';
    }

    return {
      success: false,
      error: resultErrorMessage,
      rawAIResponse: aiResponse,
      prompt: userPrompt,
      platform: platform,
      executionTime: `${Date.now() - startTime}ms`,
      aiProvider: 'groq'
    };
  }
}

// ── Helper: Quota Exceeded Result ──

function buildQuotaExceededResult(userPrompt, platform, startTime) {
  const fallbackWorkflow = generateFallbackWorkflow(userPrompt, platform, 'AI quota limits were reached');
  return {
    success: true,
    workflow: fallbackWorkflow,
    prompt: userPrompt,
    platform: platform,
    executionTime: `${Date.now() - startTime}ms`,
    aiProvider: 'fallback',
    model: 'none',
    cost: '0.000000',
    warning: 'AI quota exceeded. Generated using fallback template. Please customize your workflow.'
  };
}

function buildEmptyResponseFallbackResult(userPrompt, platform, startTime) {
  const fallbackWorkflow = generateFallbackWorkflow(
    userPrompt,
    platform,
    'the AI returned an empty response after retries'
  );

  return {
    success: true,
    workflow: fallbackWorkflow,
    prompt: userPrompt,
    platform: platform,
    executionTime: `${Date.now() - startTime}ms`,
    aiProvider: 'fallback',
    model: 'none',
    cost: '0.000000',
    warning: 'AI returned an empty response. Generated fallback template. Please refine and regenerate.'
  };
}

function buildMalformedResponseFallbackResult(userPrompt, platform, startTime, parseErrorMessage, rawAIResponse) {
  const fallbackWorkflow = generateFallbackWorkflow(
    userPrompt,
    platform,
    'the AI returned malformed JSON'
  );

  return {
    success: true,
    workflow: fallbackWorkflow,
    prompt: userPrompt,
    platform: platform,
    executionTime: `${Date.now() - startTime}ms`,
    aiProvider: 'fallback',
    model: 'none',
    cost: '0.000000',
    warning: `AI response could not be parsed (${parseErrorMessage}). Generated fallback template.`,
    debug: {
      parseError: parseErrorMessage,
      hasRawAIResponse: Boolean(rawAIResponse)
    }
  };
}

// ── Example Prompts ──

function getExamplePrompts() {
  return [
    "When a new row is added in Google Sheets, send a Slack notification",
    "Every morning, fetch RSS feed items and email me a summary",
    "When a GitHub issue is created, post it to Discord and log in Notion",
    "Monitor a website for changes and notify me via Telegram",
    "When a new Stripe payment comes in, update Google Sheets and send a receipt email",
    "Collect Typeform responses, enrich with Clearbit, and add to HubSpot",
    "When a Jira ticket is resolved, update Confluence and notify the team via Slack",
    "Fetch weather data daily and send SMS alerts for severe conditions"
  ];
}

export { generateWorkflowFromText, getExamplePrompts };
