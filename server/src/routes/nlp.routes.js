// server/src/routes/nlp.routes.js

import express from 'express';
import {
generateWorkflow,
generateAndRunWorkflow,
getExamples,
healthCheck
} from '../controllers/nlp.controller.js';

const router = express.Router();

/**
 * @route   POST /api/nlp/generate
 * @desc    Generate workflow from text prompt using Gemini
 * @access  Public (will be protected later)
 * @body    { "prompt": "your prompt here", "model": "gemini-1.5-flash" (optional) }
 */
router.post('/generate', generateWorkflow);

/**
 * @route   POST /api/nlp/generate-and-run
 * @desc    Generate workflow with Gemini and immediately execute it
 * @access  Public
 * @body    { "prompt": "your prompt here" }
 */
router.post('/generate-and-run', generateAndRunWorkflow);

/**
 * @route   GET /api/nlp/examples
 * @desc    Get example prompts for testing
 * @access  Public
 */
router.get('/examples', getExamples);

/**
 * @route   GET /api/nlp/health
 * @desc    Health check for NLP service
 * @access  Public
 */
router.get('/health', healthCheck);

export default router;
