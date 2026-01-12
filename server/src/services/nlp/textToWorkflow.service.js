import { GoogleGenerativeAI } from '@google/generative-ai';
import systemPrompt from './promptTemplates.js';
import { getAvailableNodeTypes, isNodeTypeSupported } from '../orchestrator/nodeRegistry.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { getCachedWorkflow, setCachedWorkflow } from './promptCache.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

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
    error?.message?.toLowerCase().includes('too many requests');
}

// Try to extract JSON output robustly. Supports explicit delimiters and performs cleanup/auto-fix.
function extractWorkflowJSON(response) {
  if (!response || typeof response !== 'string') {
    throw new Error('AI response is empty');
  }

  let content = response.trim();

  // Prefer explicit delimiters if present (e.g., <<<JSON>>> ... <<<END_JSON>>>)
  const delimMatch = content.match(/<<<JSON>>>([\s\S]*?)<<<END_JSON>>>/i);
  if (delimMatch && delimMatch[1]) {
    content = delimMatch[1].trim();
  }

  // Remove common code fences and surrounding text
  content = content.replace(/```json|```/gi, '');
  content = content.replace(/Respond only with the JSON object[:\s]*/i, '');
  content = content.trim();

  // Perform lightweight cleanup: remove trailing commas before array/object closers
  content = content.replace(/,\s*(?=[}\]])/g, '');

  // Fix unterminated string quotes if present (common with truncated outputs)
  content = closeOpenQuotes(content);

  // Auto-balance braces and brackets if possible
  content = autoBalanceBrackets(content);

  // Find the first JSON object in the text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }

  try {
    const workflow = JSON.parse(jsonMatch[0]);
    return workflow;
  } catch (err) {
    throw new Error('Failed to parse JSON from AI response: ' + err.message);
  }
}

// Auto-balance braces/brackets by appending missing closers (simple heuristic)
function autoBalanceBrackets(text) {
  const openers = { '{': '}', '[': ']' };
  const stack = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{' || ch === '[') stack.push(openers[ch]);
    else if (ch === '}' || ch === ']') {
      // pop if matches
      if (stack.length && stack[stack.length - 1] === ch) stack.pop();
      else {
        // unmatched closing - ignore
      }
    }
  }
  // append missing closers
  if (stack.length) {
    return text + stack.reverse().join('');
  }
  return text;
}

// Fix unterminated double-quoted strings by attempting to add a closing quote.
function closeOpenQuotes(text) {
  if (typeof text !== 'string') return text;
  const withoutEscaped = text.replace(/\\"/g, '');
  const quoteCount = (withoutEscaped.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    // Try to add a closing quote before the last closing brace if present
    const lastBrace = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (lastBrace > -1) {
      return text.slice(0, lastBrace) + '"' + text.slice(lastBrace);
    }
    return text + '"';
  }
  return text;
}

// Enhanced local JSON repair - tries multiple strategies before giving up
function enhancedLocalJSONRepair(rawResponse) {
  let content = rawResponse;

  // Strategy 1: Extract between delimiters
  const delimMatch = content.match(/<<<JSON>>>([\s\S]*?)<<<END_JSON>>>/i);
  if (delimMatch && delimMatch[1]) {
    content = delimMatch[1];
  }

  // Strategy 2: Remove markdown code fences
  content = content.replace(/```json\s*/gi, '');
  content = content.replace(/```\s*/gi, '');

  // Strategy 3: Find first { and last }
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    content = content.slice(firstBrace, lastBrace + 1);
  }

  // Strategy 4: Remove trailing commas
  content = content.replace(/,\s*(?=[}\]])/g, '');

  // Strategy 5: Fix unterminated strings
  content = closeOpenQuotes(content);

  // Strategy 6: Auto-balance brackets
  content = autoBalanceBrackets(content);

  // Strategy 7: Try to fix common issues
  // Remove any text after the final }
  const finalBrace = content.lastIndexOf('}');
  if (finalBrace > 0) {
    content = content.slice(0, finalBrace + 1);
  }

  return content.trim();
}

// Attempt to repair unsupported node types locally using a simple alias map
function repairUnsupportedTypesLocally(workflow) {
  if (!workflow || !Array.isArray(workflow.nodes)) return null;
  const aliases = {
    'emailsender': 'emailGenerator',
    'emailservice': 'emailGenerator',
    'email-service': 'emailGenerator',
    's3': 's3Upload',
    's3upload': 's3Upload',
    'smssender': 'smsSender',
    'sms': 'smsSender',
    'googlesheets': 'googleSheets',
    'google-sheets': 'googleSheets',
    'calendar': 'calendarEvent',
    'pagerduty': 'pagerDuty',
    'pager-duty': 'pagerDuty',
    'twitter': 'twitterApi',
    'twitterapi': 'twitterApi',
    'xapi': 'twitterApi',
    // Additional common aliases
    'email': 'emailGenerator',
    'slack': 'slackSender',
    'webhook': 'webhookTrigger',
    'http': 'dataFetcher',
    'api': 'dataFetcher',
    'fetch': 'dataFetcher',
    'scrape': 'webScraper',
    'scraper': 'webScraper',
    'summarize': 'aiSummarizer',
    'summarizer': 'aiSummarizer',
    'ai': 'aiSummarizer',
    'transform': 'dataTransformer',
    'transformer': 'dataTransformer'
  };

  let changed = false;
  workflow.nodes.forEach(node => {
    if (!node || !node.type) return;
    const norm = String(node.type).toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');
    if (!isNodeTypeSupported(node.type)) {
      const mapped = aliases[norm];
      if (mapped && isNodeTypeSupported(mapped)) {
        console.log(`🔧 Local repair: ${node.type} → ${mapped}`);
        node.type = mapped;
        changed = true;
      } else {
        // Fallback to dataFetcher for unknown types
        console.log(`🔧 Local repair: ${node.type} → dataFetcher (fallback)`);
        node.type = 'dataFetcher';
        changed = true;
      }
    }
  });

  return changed ? workflow : null;
}

// Add missing platform-specific nodes when their presence is obvious from labels/data
function addMissingPlatformNodes(workflow) {
  if (!workflow || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) return false;

  const platformKeywords = {
    'twitter': 'twitterApi',
    'x.com': 'twitterApi',
    'linkedin': 'linkedinApi',
    'instagram': 'instagramApi',
    'sheets': 'googleSheets',
    'google sheets': 'googleSheets',
    'sms': 'smsSender',
    's3': 's3Upload',
    'pagerduty': 'pagerDuty',
    'slack': 'slackSender',
    'email': 'emailGenerator'
  };

  // helper to detect keyword in node label or data
  const mentionsPlatform = (node) => {
    const checkText = (t) => (t || '').toString().toLowerCase();
    const combined = checkText(node.data?.label) + ' ' + checkText(node.data?.source) + ' ' + checkText(node.data?.url) + ' ' + checkText(node.label);
    for (const [kw, handler] of Object.entries(platformKeywords)) {
      if (combined.includes(kw)) return handler;
    }
    return null;
  };

  // find next numeric id
  const existingIds = new Set(workflow.nodes.map(n => String(n.id)));
  let nextId = 1;
  while (existingIds.has(String(nextId))) nextId++;

  let added = false;

  workflow.nodes.forEach(node => {
    const requiredHandler = mentionsPlatform(node);
    if (requiredHandler && !workflow.nodes.some(n => n.type === requiredHandler)) {
      const newNode = {
        id: String(nextId++),
        type: requiredHandler,
        data: { label: requiredHandler, inferredFor: node.id }
      };
      workflow.nodes.unshift(newNode);
      // Add edge from platform node to the node
      workflow.edges.push({ source: newNode.id, target: node.id });
      added = true;
    }
  });

  return added;
}

function validateWorkflowStructure(workflow) {
  if (!workflow || typeof workflow !== 'object') throw new Error('Workflow must be an object');
  if (!Array.isArray(workflow.nodes)) throw new Error('Workflow must have a "nodes" array');
  if (!Array.isArray(workflow.edges)) throw new Error('Workflow must have an "edges" array');
  if (workflow.nodes.length === 0) throw new Error('Workflow must have at least one node');

  workflow.nodes.forEach((node, i) => {
    if (!node.id) throw new Error(`Node at index ${i} is missing required field: id`);
    if (!node.type) throw new Error(`Node ${node.id || i} is missing required field: type`);
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

function enhanceWorkflow(workflow, userPrompt) {
  return {
    ...workflow,
    metadata: {
      generatedFrom: userPrompt,
      generatedAt: new Date().toISOString(),
      version: '1.0',
      aiProvider: 'gemini'
    }
  };
}

/**
 * Generate a minimal fallback workflow when AI is unavailable
 * This ensures the app remains functional even without AI
 */
function generateFallbackWorkflow(userPrompt) {
  console.log('⚠️ Using fallback workflow generator (AI quota exceeded)');

  // Parse prompt for basic keywords to make slightly relevant template
  const promptLower = userPrompt.toLowerCase();

  let nodes = [];
  let edges = [];

  // Always start with a data fetcher
  nodes.push({
    id: '1',
    type: 'dataFetcher',
    data: { label: 'Data Fetcher', description: 'Fetches initial data' }
  });

  // Add a middle processing node based on keywords
  if (promptLower.includes('summariz') || promptLower.includes('ai')) {
    nodes.push({
      id: '2',
      type: 'aiSummarizer',
      data: { label: 'AI Summarizer', description: 'Processes and summarizes data' }
    });
  } else if (promptLower.includes('transform') || promptLower.includes('process')) {
    nodes.push({
      id: '2',
      type: 'dataTransformer',
      data: { label: 'Data Transformer', description: 'Transforms data' }
    });
  } else {
    nodes.push({
      id: '2',
      type: 'dataTransformer',
      data: { label: 'Data Transformer', description: 'Processes data' }
    });
  }

  // Add output node based on keywords
  if (promptLower.includes('email')) {
    nodes.push({
      id: '3',
      type: 'emailGenerator',
      data: { label: 'Email Generator', description: 'Sends email output' }
    });
  } else if (promptLower.includes('slack')) {
    nodes.push({
      id: '3',
      type: 'slackSender',
      data: { label: 'Slack Sender', description: 'Sends to Slack' }
    });
  } else {
    nodes.push({
      id: '3',
      type: 'slackSender',
      data: { label: 'Output', description: 'Sends notification' }
    });
  }

  // Create edges
  edges = [
    { source: '1', target: '2' },
    { source: '2', target: '3' }
  ];

  return {
    nodes,
    edges,
    metadata: {
      generatedFrom: userPrompt,
      generatedAt: new Date().toISOString(),
      version: '1.0',
      aiProvider: 'fallback',
      note: 'Generated using fallback template due to AI quota limits. Please customize as needed.'
    }
  };
}

/**
 * Call Gemini API with exponential backoff retry
 */
async function callGeminiWithRetry(model, prompt, maxRetries = MAX_RETRIES) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Gemini API call attempt ${attempt}/${maxRetries}`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);

      if (isRateLimitError(error)) {
        if (attempt < maxRetries) {
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`⏳ Rate limited. Waiting ${delay}ms before retry...`);
          await sleep(delay);
        } else {
          // All retries exhausted, this is a quota issue
          throw new Error('QUOTA_EXCEEDED');
        }
      } else {
        // Not a rate limit error, don't retry
        throw error;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

async function generateWorkflowFromText(userPrompt, options = {}) {
  const startTime = Date.now();
  let aiResponse = '';
  const requestedModel = options.model || 'gemini-2.5-flash';

  try {
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      throw new Error('Prompt must be a non-empty string');
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in environment variables');
    }

    // Check cache first
    const cachedResult = getCachedWorkflow(userPrompt, requestedModel);
    if (cachedResult) {
      console.log('🎯 Returning cached workflow result');
      return {
        ...cachedResult,
        cached: true,
        executionTime: `${Date.now() - startTime}ms`
      };
    }

    // Use deterministic generation for structured JSON outputs
    const model = genAI.getGenerativeModel({
      model: requestedModel,
      generationConfig: {
        temperature: 0.0,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024
      }
    });

    const allowedTypes = getAvailableNodeTypes().join(', ');

    const fullPrompt = `${systemPrompt}\n\nAllowed node types: ${allowedTypes}.\nUse ONLY these node types EXACTLY as listed for the \"type\" field in the JSON. Do NOT invent or use any other node types.\n\nIf the user mentions specific platforms (e.g., Twitter, LinkedIn, Instagram, Google Sheets, Slack, PagerDuty, S3, SMS), you MUST include a dedicated node of the corresponding handler (for example, use the exact string \"twitterApi\" for Twitter).\n\nReturn the JSON between <<<JSON>>> and <<<END_JSON>>>.\n\nExample (use exact type names):\n<<<JSON>>>\n{\n  "nodes": [\n    { "id": "1", "type": "twitterApi", "data": { "source": "twitter", "query": "news" } },\n    { "id": "2", "type": "webScraper", "data": { "url": "https://twitter.com/somehandle", "inputFrom": "1" } }\n  ],\n  "edges": [ { "source": "1", "target": "2" } ]\n}\n<<<END_JSON>>>\n\nNow, convert this user request into a workflow JSON:\n\nUser Request: \"${userPrompt}\"\n\nYour JSON Response:`;

    // Call the model with retry logic
    try {
      aiResponse = await callGeminiWithRetry(model, fullPrompt);
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        // Use fallback generator
        const fallbackWorkflow = generateFallbackWorkflow(userPrompt);
        const executionTime = Date.now() - startTime;

        const fallbackResult = {
          success: true,
          workflow: fallbackWorkflow,
          prompt: userPrompt,
          executionTime: `${executionTime}ms`,
          aiProvider: 'fallback',
          model: 'none',
          cost: '0.000000',
          warning: 'AI quota exceeded. Generated using fallback template. Please customize your workflow.'
        };

        // Don't cache fallback results
        return fallbackResult;
      }
      throw error;
    }

    // Try to extract and validate JSON - use only local repair
    let workflow;
    try {
      workflow = extractWorkflowJSON(aiResponse);
      validateWorkflowStructure(workflow);
    } catch (parseErr) {
      console.warn('Initial JSON extraction failed:', parseErr.message);

      // Use enhanced local repair only - NO AI retry
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

    // Auto-insert platform nodes when obvious (e.g., mention of Twitter, Sheets, SMS, etc.)
    try {
      const addedPlatform = addMissingPlatformNodes(workflow);
      if (addedPlatform) {
        // re-validate after injection
        validateWorkflowStructure(workflow);
      }
    } catch (err) {
      console.warn('Platform auto-insert failed:', err.message);
    }

    // Ensure all node types are supported by our backend - LOCAL REPAIR ONLY
    const unsupportedTypes = Array.from(new Set(workflow.nodes
      .map(n => n.type)
      .filter(t => !isNodeTypeSupported(t))));

    if (unsupportedTypes.length > 0) {
      console.warn('Unsupported node types found:', unsupportedTypes);

      // Use local alias-based repair only - NO AI call
      const localRepair = repairUnsupportedTypesLocally(workflow);
      if (localRepair) {
        try {
          validateWorkflowStructure(localRepair);
          workflow = localRepair;
          console.log('✅ All unsupported types fixed locally');
        } catch (vErr) {
          console.warn('Local repair validation failed:', vErr.message);
        }
      }
    }

    const enhancedWorkflow = enhanceWorkflow(workflow, userPrompt);
    const executionTime = Date.now() - startTime;

    const result = {
      success: true,
      workflow: enhancedWorkflow,
      prompt: userPrompt,
      executionTime: `${executionTime}ms`,
      aiProvider: 'gemini',
      model: requestedModel,
      cost: '0.000000'
    };

    // Cache successful result
    setCachedWorkflow(userPrompt, requestedModel, result);

    return result;

  } catch (error) {
    console.error('Workflow generation failed:', error.message);
    if (aiResponse) console.error('Raw AI response on failure:', aiResponse);

    // If model explicitly returned INVALID_JSON, make the error message clearer
    let resultErrorMessage = error.message;
    if (aiResponse && /INVALID_JSON/i.test(aiResponse)) {
      resultErrorMessage = 'AI could not produce valid JSON (model returned INVALID_JSON).';
    }

    return {
      success: false,
      error: resultErrorMessage,
      rawAIResponse: aiResponse,
      prompt: userPrompt,
      executionTime: `${Date.now() - startTime}ms`,
      aiProvider: 'gemini'
    };
  }
}

function getExamplePrompts() {
  return [
    "Fetch data from an API and send it to Slack",
    "Get tweets about AI, summarize them, and email me the summary",
    "Scrape a website, transform the data, and send to Slack",
    "Fetch data, summarize it, and send notifications",
    "Get customer feedback, analyze it with AI, and email results",
    "Monitor social media, extract trends, and notify team",
    "Collect survey responses, summarize insights, and share via email",
    "Fetch news articles, filter by topic, and post to Slack"
  ];
}

export { generateWorkflowFromText, getExamplePrompts };
