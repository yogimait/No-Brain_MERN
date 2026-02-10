// server/src/routes/agent.routes.js
// Routes for agentic workflow generation

import express from 'express';
import {
    generateWorkflow,
    getAvailableNodes,
    healthCheck,
    getExamples
} from '../controllers/agent.controller.js';

const router = express.Router();

/**
 * @route   POST /api/agent/generate-workflow
 * @desc    Generate workflow from text prompt using agentic system
 * @access  Public
 * @body    { "prompt": "your prompt here", "mode": "agentic" | "ai" (optional, default: "agentic") }
 */
router.post('/generate-workflow', generateWorkflow);

/**
 * @route   GET /api/agent/nodes
 * @desc    Get available node types from registry
 * @access  Public
 */
router.get('/nodes', getAvailableNodes);

/**
 * @route   GET /api/agent/examples
 * @desc    Get example prompts for testing
 * @access  Public
 */
router.get('/examples', getExamples);

/**
 * @route   GET /api/agent/health
 * @desc    Health check for agent service
 * @access  Public
 */
router.get('/health', healthCheck);

export default router;
