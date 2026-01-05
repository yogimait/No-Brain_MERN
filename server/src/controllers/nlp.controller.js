// server/src/controllers/nlp.controller.js

import { generateWorkflowFromText, getExamplePrompts } from '../services/nlp/textToWorkflow.service.js';
import { getAvailableNodeTypes } from '../services/orchestrator/nodeRegistry.js';
import { runWorkflow } from '../services/orchestrator.service.js';
import  ApiResponse  from '../utils/ApiResponse.js';
import  ApiError  from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Generate workflow from text prompt
 * POST /api/nlp/generate
 */
const generateWorkflow = asyncHandler(async (req, res) => {
  const { prompt, model } = req.body;
  
  // Validate input
  if (!prompt) {
    throw new ApiError(400, 'Prompt is required');
  }
  
  // Generate workflow using Gemini
  const result = await generateWorkflowFromText(prompt, { model });
  
  if (result.success) {
    res.status(200).json(
      new ApiResponse(200, result, 'Workflow generated successfully using Gemini AI')
    );
  } else {
    throw new ApiError(500, result.error, result);
  }
});

/**
 * Generate and immediately execute workflow
 * POST /api/nlp/generate-and-run
 */
const generateAndRunWorkflow = asyncHandler(async (req, res) => {
  const { prompt, model } = req.body;
  
  if (!prompt) {
    throw new ApiError(400, 'Prompt is required');
  }
  
  // Step 1: Generate workflow with Gemini
  console.log('Step 1: Generating workflow with Gemini...');
  const generationResult = await generateWorkflowFromText(prompt, { model });
  
  if (!generationResult.success) {
    throw new ApiError(500, 'Failed to generate workflow: ' + generationResult.error);
  }
  
  // Step 2: Execute workflow
  console.log('Step 2: Executing generated workflow...');
  const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const executionResult = await runWorkflow(generationResult.workflow, {
    runId,
    userId: req.user?.id || 'guest',
    generatedFrom: 'nlp-gemini',
    originalPrompt: prompt
  });
  
  // Combine results
  res.status(200).json(
    new ApiResponse(200, {
      generation: generationResult,
      execution: executionResult
    }, 'Workflow generated with Gemini and executed successfully')
  );
});

/**
 * Get example prompts
 * GET /api/nlp/examples
 */
const getExamples = asyncHandler(async (req, res) => {
  const examples = getExamplePrompts();
  
  res.status(200).json(
    new ApiResponse(200, { 
      examples, 
      count: examples.length,
      aiProvider: 'gemini'
    }, 'Example prompts retrieved')
  );
});

/**
 * Health check
 * GET /api/nlp/health
 */
const healthCheck = asyncHandler(async (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  
  res.status(200).json(
    new ApiResponse(200, {
      status: 'healthy',
      service: 'nlp',
      aiProvider: 'gemini',
      geminiConfigured: hasApiKey,
      freeForever: true,
      timestamp: new Date().toISOString(),
      availableNodeTypes: getAvailableNodeTypes()
    }, 'NLP service is healthy')
  );
});

const getAvailableNodes = asyncHandler(async (req, res) => {
  const types = getAvailableNodeTypes();
  res.status(200).json(new ApiResponse(200, { types, count: types.length }, 'Available node types'));
});

export {
  generateWorkflow,
  generateAndRunWorkflow,
  getExamples,
  healthCheck,
  getAvailableNodes
};
