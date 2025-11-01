// server/src/controllers/orchestrator.controller.js

import { runWorkflow } from '../services/orchestrator.service.js';
import { getAvailableNodeTypes } from '../services/orchestrator/nodeRegistry.js';
import  ApiResponse  from '../utils/ApiResponse.js';
import  ApiError  from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Execute a workflow
 * POST /api/orchestrator/run
 * Body: { nodes: [], edges: [] }
 */
const executeWorkflow = asyncHandler(async (req, res) => {
  const workflow = req.body;
  
  // Generate run ID
  const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Execute workflow
  const result = await runWorkflow(workflow, {
    runId,
    userId: req.user?.id || 'guest', // Will be from auth middleware later
    timestamp: new Date().toISOString()
  });
  
  // Return response
  if (result.success) {
    res.status(200).json(
      new ApiResponse(200, result, 'Workflow executed successfully')
    );
  } else {
    throw new ApiError(500, result.error || 'Workflow execution failed', result);
  }
});

/**
 * Get available node types
 * GET /api/orchestrator/node-types
 */
const getNodeTypes = asyncHandler(async (req, res) => {
  const nodeTypes = getAvailableNodeTypes();
  
  res.status(200).json(
    new ApiResponse(200, { nodeTypes, count: nodeTypes.length }, 'Node types retrieved successfully')
  );
});

/**
 * Health check endpoint
 * GET /api/orchestrator/health
 */
const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { 
      status: 'healthy',
      service: 'orchestrator',
      timestamp: new Date().toISOString()
    }, 'Orchestrator service is healthy')
  );
});

export {
  executeWorkflow,
  getNodeTypes,
  healthCheck
};
