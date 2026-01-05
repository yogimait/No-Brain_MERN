import { GoogleGenerativeAI } from '@google/generative-ai';
import systemPrompt from './promptTemplates.js';
import { getAvailableNodeTypes, isNodeTypeSupported } from '../orchestrator/nodeRegistry.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

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
    'xapi': 'twitterApi'
  };

  let changed = false;
  workflow.nodes.forEach(node => {
    if (!node || !node.type) return;
    const norm = String(node.type).toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');
    if (!isNodeTypeSupported(node.type)) {
      const mapped = aliases[norm];
      if (mapped && isNodeTypeSupported(mapped)) {
        node.type = mapped;
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

async function generateWorkflowFromText(userPrompt, options = {}) {
  const startTime = Date.now();
  let aiResponse = '';

  try {
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      throw new Error('Prompt must be a non-empty string');
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in environment variables');
    }

    const requestedModel = options.model || 'gemini-2.5-flash';
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

    const fullPrompt = `${systemPrompt}\n\nAllowed node types: ${allowedTypes}.\nUse ONLY these node types EXACTLY as listed for the \"type\" field in the JSON. Do NOT invent or use any other node types.\n\nIf the user mentions specific platforms (e.g., Twitter, LinkedIn, Instagram, Google Sheets, Slack, PagerDuty, S3, SMS), you MUST include a dedicated node of the corresponding handler (for example, use the exact string \"twitterApi\" for Twitter).\n\nReturn the JSON between <<<JSON>>> and <<<END_JSON>>>.\n\nExample (use exact type names):\n<<<JSON>>>\n{\n  "nodes": [\n    { "id": "1", "type": "twitterApi", "data": { "source": "twitter", "query": "news" } },\n    { "id": "2", "type": "webScraper", "data": { "url": "https://twitter.com/somehandle", "inputFrom": "1" } }\n  ],\n  "edges": [ { "source": "1", "target": "2" } ]\n}\n<<<END_JSON>>>\n\nNow, convert this user request into a workflow JSON:\n\nUser Request: "${userPrompt}"\n\nYour JSON Response:`;

    // Call the model
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    aiResponse = response.text();

    // First attempt: extract and validate
    let workflow;
    try {
      workflow = extractWorkflowJSON(aiResponse);
      validateWorkflowStructure(workflow);
    } catch (parseErr) {
      console.warn('Initial JSON extraction failed:', parseErr.message);

      // First attempt: automated cleanup (remove trailing commas, auto-close braces/brackets, fix unterminated strings)
      const autoCleaned = (function(c) {
        let t = c.replace(/```json|```/gi, '');
        // If delimiters present, extract between them
        const delimMatch = t.match(/<<<JSON>>>([\s\S]*?)<<<END_JSON>>>/i);
        if (delimMatch && delimMatch[1]) t = delimMatch[1];
        t = t.replace(/,\s*(?=[}\]])/g, '');
        t = closeOpenQuotes(t);
        t = autoBalanceBrackets(t);
        // Trim any leading non-json characters before first '{'
        const firstBrace = t.indexOf('{');
        if (firstBrace > 0) t = t.slice(firstBrace);
        return t.trim();
      })(aiResponse);

      try {
        workflow = extractWorkflowJSON(autoCleaned);
        validateWorkflowStructure(workflow);
      } catch (autoErr) {
        // If automated cleanup didn't work, ask the model to repair but force delimiters and no positions
        const repairPrompt = `${systemPrompt}\n\nThe model produced the following output but it was not valid JSON for the expected workflow schema:\n\n${aiResponse}\n\nPLEASE CORRECT the JSON and return ONLY the corrected JSON *between* the delimiters <<<JSON>>> and <<<END_JSON>>>. Do NOT include any explanatory text or code fences. **Do NOT include any \"position\" fields**. Ensure there are no trailing commas and the JSON is properly closed. If you cannot produce valid JSON, return the literal text INVALID_JSON between the delimiters.`;

        // Use deterministic generation for repair pass
        const repairModel = genAI.getGenerativeModel({
          model: requestedModel,
          generationConfig: { temperature: 0.0, topK: 0, topP: 0.0, maxOutputTokens: 512 }
        });

        const repairResult = await repairModel.generateContent(repairPrompt);
        const repairResp = await repairResult.response;
        const repairedText = repairResp.text();
        aiResponse = repairedText; // keep for logs/metadata

        // Try parsing repaired text
        workflow = extractWorkflowJSON(repairedText);
        validateWorkflowStructure(workflow);
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

    // Ensure all node types are supported by our backend
    const unsupportedTypes = Array.from(new Set(workflow.nodes
      .map(n => n.type)
      .filter(t => !isNodeTypeSupported(t))));

    if (unsupportedTypes.length > 0) {
      console.warn('Unsupported node types found:', unsupportedTypes);

      // First attempt: try to repair unsupported types locally using aliases
      const localRepair = repairUnsupportedTypesLocally(workflow);
      if (localRepair) {
        try {
          validateWorkflowStructure(localRepair);
          workflow = localRepair;
        } catch (vErr) {
          console.warn('Local repair did not validate:', vErr.message);
        }
      }

      // Recompute unsupported types after local repair
      const remainingUnsupported = Array.from(new Set(workflow.nodes
        .map(n => n.type)
        .filter(t => !isNodeTypeSupported(t))));

      if (remainingUnsupported.length === 0) {
        console.log('All unsupported types were handled locally');
      } else {
        const typesList = getAvailableNodeTypes().join(', ');
        const replacePrompt = `${systemPrompt}\n\nThe JSON below contains node types that are NOT supported by the system: ${remainingUnsupported.join(', ')}.\nAllowed node types are: ${typesList}.\nPlease replace any unsupported node types with the closest matching supported types from the allowed list (keep node ids and data unchanged). Return ONLY the corrected JSON *between* <<<JSON>>> and <<<END_JSON>>>. Do NOT include any \"position\" fields or additional text. If you cannot produce valid JSON, return INVALID_JSON between the delimiters.\n\nHere is the JSON to correct:\n\n${aiResponse}`;

        const repairModel2 = genAI.getGenerativeModel({
          model: requestedModel,
          generationConfig: { temperature: 0.0, topK: 0, topP: 0.0, maxOutputTokens: 512 }
        });

        const repairResult2 = await repairModel2.generateContent(replacePrompt);
        const repairResp2 = await repairResult2.response;
        const repairedText2 = repairResp2.text();
        aiResponse = repairedText2;

        // Try parsing repaired text
        const repairedWorkflow = extractWorkflowJSON(repairedText2);
        validateWorkflowStructure(repairedWorkflow);
        workflow = repairedWorkflow;
      }
    }

    const enhancedWorkflow = enhanceWorkflow(workflow, userPrompt);
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      workflow: enhancedWorkflow,
      prompt: userPrompt,
      executionTime: `${executionTime}ms`,
      aiProvider: 'gemini',
      model: requestedModel,
      cost: '0.000000'
    };

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
