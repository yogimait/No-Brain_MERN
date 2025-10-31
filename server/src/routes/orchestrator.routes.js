// server/src/routes/orchestrator.routes.js

import express from 'express';
import { executeWorkflow, getNodeTypes, healthCheck } from '../controllers/orchestrator.controller.js';

const router = express.Router();

/**
 * @route   POST /api/orchestrator/run
 * @desc    Execute a workflow
 * @access  Public (will be protected later)
 */
router.post('/run', executeWorkflow);

/**
 * @route   GET /api/orchestrator/node-types
 * @desc    Get list of available node types
 * @access  Public
 */
router.get('/node-types', getNodeTypes);

/**
 * @route   GET /api/orchestrator/health
 * @desc    Health check
 * @access  Public
 */
router.get('/health', healthCheck);

export default router;
// this is routes file for orchestrator