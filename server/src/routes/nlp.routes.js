// server/src/routes/nlp.routes.js

import express from 'express';
import {
  generateWorkflow,
  generateAndRunWorkflow,
  getExamples,
  healthCheck,
  getAvailableNodes
} from '../controllers/nlp.controller.js';
import { nlpRateLimiter } from '../middlewares/nlpRateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/nlp/generate
 * @desc    Generate workflow from text prompt using Gemini
 * @access  Public (rate limited)
 * @body    { "prompt": "your prompt here", "model": "gemini-2.5-flash" (optional) }
 */
router.post('/generate', nlpRateLimiter, generateWorkflow);

/**
 * @route   POST /api/nlp/generate-and-run
 * @desc    Generate workflow with Gemini and immediately execute it
 * @access  Public (rate limited)
 * @body    { "prompt": "your prompt here" }
 */
router.post('/generate-and-run', nlpRateLimiter, generateAndRunWorkflow);

/**
 * @route   GET /api/nlp/examples
 * @desc    Get example prompts for testing
 * @access  Public
 */
router.get('/examples', getExamples);

/**
 * @route   GET /api/nlp/nodes
 * @desc    Get available node types (backend)
 * @access  Public
 */
router.get('/nodes', getAvailableNodes);

/**
 * @route   GET /api/nlp/health
 * @desc    Health check for NLP service
 * @access  Public
 */
router.get('/health', healthCheck);

export default router;
