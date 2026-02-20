// server/src/controllers/nlp.controller.js
// Phase-2: Platform-aware workflow generation

import { generateWorkflowFromText, getExamplePrompts } from '../services/nlp/textToWorkflow.service.js';
import { isPlatformSupported, getSupportedPlatforms, getNodeLabels } from '../domains/platform/platform.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Generate workflow from text prompt
 * POST /api/nlp/generate
 */
const generateWorkflow = asyncHandler(async (req, res) => {
  let { prompt, model, platform } = req.body;

  // Validate prompt
  if (!prompt) {
    throw new ApiError(400, 'Prompt is required');
  }

  // ── Phase-2: Platform validation ──
  // Reject if platform missing
  if (!platform) {
    throw new ApiError(400, 'Platform is required. Supported platforms: ' + getSupportedPlatforms().join(', '));
  }

  // Normalize platform (trim + lowercase)
  platform = platform.trim().toLowerCase();

  // Reject if platform unsupported
  if (!isPlatformSupported(platform)) {
    console.warn(`⚠️ [NLP] Unsupported platform requested: "${platform}"`);
    throw new ApiError(400, `Unsupported platform: "${platform}". Supported platforms: ${getSupportedPlatforms().join(', ')}`);
  }

  // Verify catalog is available (graceful failure)
  const nodeLabels = getNodeLabels(platform);
  if (nodeLabels.length === 0) {
    console.error(`❌ [NLP] Platform catalog unavailable for "${platform}"`);
    throw new ApiError(503, `Platform catalog for "${platform}" is temporarily unavailable. Please try again later.`);
  }

  // Generate workflow using Groq with platform constraint
  const result = await generateWorkflowFromText(prompt, { model, platform });

  if (result.success) {
    res.status(200).json(
      new ApiResponse(200, result, `Workflow generated successfully for platform: ${platform}`)
    );
  } else {
    throw new ApiError(500, result.error, result);
  }
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
      aiProvider: 'groq'
    }, 'Example prompts retrieved')
  );
});

/**
 * Health check
 * GET /api/nlp/health
 */
const healthCheck = asyncHandler(async (req, res) => {
  const hasApiKey = !!process.env.GROQ_API_KEY;

  res.status(200).json(
    new ApiResponse(200, {
      status: 'healthy',
      service: 'nlp',
      aiProvider: 'groq',
      groqConfigured: hasApiKey,
      supportedPlatforms: getSupportedPlatforms(),
      freeForever: true,
      timestamp: new Date().toISOString()
    }, 'NLP service is healthy')
  );
});

const getAvailableNodes = asyncHandler(async (req, res) => {
  const platform = req.query.platform?.trim().toLowerCase() || 'n8n';

  if (!isPlatformSupported(platform)) {
    throw new ApiError(400, `Unsupported platform: "${platform}"`);
  }

  const labels = getNodeLabels(platform);
  res.status(200).json(new ApiResponse(200, { labels, count: labels.length, platform }, 'Available node labels'));
});

export {
  generateWorkflow,
  getExamples,
  healthCheck,
  getAvailableNodes
};
