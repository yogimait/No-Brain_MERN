// server/src/routes/planning.routes.js
// Phase-6: Planning domain routes — explainability endpoint

import express from 'express';
import { explainWorkflow } from '../domains/planning/planner.explainer.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/planning/explain
 * @desc    Generate deterministic explanation for a workflow graph
 * @access  Public
 * @body    { nodes: [...], edges: [...], platform: "n8n" }
 */
router.post('/explain', asyncHandler(async (req, res) => {
  const { nodes, edges, platform } = req.body;

  // Validate required fields
  if (!nodes || !Array.isArray(nodes)) {
    throw new ApiError(400, 'Request body must include a "nodes" array.');
  }

  if (!edges || !Array.isArray(edges)) {
    throw new ApiError(400, 'Request body must include an "edges" array.');
  }

  if (nodes.length === 0) {
    throw new ApiError(400, 'Workflow must have at least one node.');
  }

  const resolvedPlatform = (platform || 'n8n').trim().toLowerCase();

  const result = explainWorkflow(nodes, edges, resolvedPlatform);

  if (result.success) {
    res.status(200).json(
      new ApiResponse(200, result, 'Workflow explanation generated successfully')
    );
  } else {
    throw new ApiError(400, result.error, { details: result.details });
  }
}));

/**
 * @route   GET /api/planning/health
 * @desc    Health check for planning service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'healthy',
      service: 'planning',
      features: ['explainability'],
      timestamp: new Date().toISOString()
    }, 'Planning service is healthy')
  );
});

export default router;
