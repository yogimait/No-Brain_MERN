import { GoogleGenerativeAI } from '@google/generative-ai';
import systemPrompt from './promptTemplates.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

function extractWorkflowJSON(response) {
  if (!response || typeof response !== 'string') {
    throw new Error('AI response is empty');
  }

  let content = response.trim();
  // Remove common code fences and surrounding text
  content = content.replace(/```json|```/gi, '');
  content = content.replace(/Respond only with the JSON object[:\s]*/i, '');
  content = content.trim();

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

    const requestedModel = options.model || 'gemini-2.5-pro';
    const model = genAI.getGenerativeModel({
      model: requestedModel,
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    });

    const fullPrompt = `${systemPrompt}\n\nNow, convert this user request into a workflow JSON:\n\nUser Request: "${userPrompt}"\n\nYour JSON Response:`;

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

      // Repair pass: ask the model to reformat previous output into JSON-only
      const repairPrompt = `${systemPrompt}\n\nThe model produced the following output but it was not valid JSON for the expected workflow schema:\n\n${aiResponse}\n\nPlease re-format the above output so that the response contains ONLY valid JSON matching the schema: {"nodes": [{"id":"","type":"","position": {"x":0,"y":0}, "data": {"label": ""}}], "edges": [{"id":"","source":"","target":""}]}. Do NOT include any explanatory text, code fences, or extra fields. Return strictly the JSON object.`;

      const repairResult = await model.generateContent(repairPrompt);
      const repairResp = await repairResult.response;
      const repairedText = repairResp.text();
      aiResponse = repairedText; // keep for logs/metadata

      // Try parsing repaired text
      workflow = extractWorkflowJSON(repairedText);
      validateWorkflowStructure(workflow);
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

    return {
      success: false,
      error: error.message,
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
