// server/src/routes/orchestrator.routes.js

import express from 'express';
import ApiResponse from '../utils/ApiResponse.js';
import { getNodeTypes, healthCheck } from '../controllers/orchestrator.controller.js';

const router = express.Router();

/**
 * @route   POST /api/orchestrator/run
 * @desc    🔴 DEPRECATED in v2 — Execution layer disabled
 * @access  Public
 */
router.post('/run', (req, res) => {
    return res.status(410).json(
        new ApiResponse(410, null, "Execution deprecated in NoBrain v2. NoBrain now focuses on workflow planning & explanation.")
    );
});

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