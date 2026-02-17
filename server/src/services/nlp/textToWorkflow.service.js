// server/src/services/nlp/textToWorkflow.service.js
// Phase-2: Platform-constrained workflow generation with catalog validation
// Production-grade: Constraint-driven planning engine (not a chatbot wrapper)

import Groq from 'groq-sdk';
import { buildSystemPrompt, buildRetrySystemPrompt } from './promptTemplates.js';
import { getNodeLabelsWithTypes, validateNodesAgainstCatalog, getCatalogVersion } from '../../domains/platform/platform.service.js';
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
  return error?.status === 429 ||
    error?.message?.includes('429') ||
    error?.message?.includes('quota') ||
    error?.message?.includes('rate limit') ||
    error?.message?.toLowerCase?.().includes('too many requests');
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

function generateFallbackWorkflow(userPrompt, platform) {
  console.log('⚠️ Using fallback workflow generator (AI quota exceeded)');

  const nodes = [
    { id: '1', label: 'Schedule Trigger', data: { description: 'Triggers workflow on a schedule' } },
    { id: '2', label: 'HTTP Request', data: { description: 'Fetches data or sends to external API' } }
  ];

  const edges = [
    { source: '1', target: '2' }
  ];

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
      note: 'Generated using fallback template due to AI quota limits. Please customize as needed.'
    }
  };
}

// ── Groq API Call with Retry ──

async function callGroqWithRetry(messages, modelId, maxRetries = MAX_RETRIES) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Groq API call attempt ${attempt}/${maxRetries}`);

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: modelId,
        temperature: 0.3,
        max_completion_tokens: 8192,
        top_p: 0.9,
        stream: false,
        stop: null
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);

      if (isRateLimitError(error)) {
        if (attempt < maxRetries) {
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`⏳ Rate limited. Waiting ${delay}ms before retry...`);
          await sleep(delay);
        } else {
          throw new Error('QUOTA_EXCEEDED');
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
    console.warn('Initial JSON extraction failed:', parseErr.message);

    const repairedContent = enhancedLocalJSONRepair(aiResponse);
    try {
      workflow = extractWorkflowJSON(repairedContent);
      validateWorkflowStructure(workflow);
      console.log('✅ Local JSON repair successful');
    } catch (repairErr) {
      console.error('❌ Local JSON repair failed:', repairErr.message);
      throw new Error('Failed to parse workflow JSON. The AI response was malformed.');
    }
  }
  return workflow;
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
    const nodesWithTypes = getNodeLabelsWithTypes(platform);
    if (nodesWithTypes.length === 0) {
      throw new Error(`Platform catalog for "${platform}" is unavailable`);
    }

    console.log(`📋 [Platform] Loaded ${nodesWithTypes.length} nodes for "${platform}"`);

    // Build structured system prompt with catalog injection
    const systemPrompt = buildSystemPrompt(nodesWithTypes, platform);

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
      aiResponse = await callGroqWithRetry(messages, requestedModel);
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        return buildQuotaExceededResult(userPrompt, platform, startTime);
      }
      throw error;
    }

    // ── Parse and Validate ──
    let workflow = parseAndValidateWorkflow(aiResponse);

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
      const retrySystemPrompt = buildRetrySystemPrompt(
        catalogValidation.invalidNodes,
        nodesWithTypes,
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
        const retryWorkflow = parseAndValidateWorkflow(retryResponse);
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
  const fallbackWorkflow = generateFallbackWorkflow(userPrompt, platform);
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
