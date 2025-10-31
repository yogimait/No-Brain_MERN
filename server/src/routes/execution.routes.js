import express from "express";
import {
  createExecution,
  getExecutionsByWorkflow,
  getExecutionByRunId,
  updateExecution,
  getAllExecutions,
} from "../controllers/execution.controller.js";

const router = express.Router();

// Create a new execution log
router.post("/", createExecution);

// Get all executions (with optional query params: workflowId, status, limit, skip)
router.get("/", getAllExecutions);

// Get all executions for a specific workflow
router.get("/workflow/:workflowId", getExecutionsByWorkflow);

// Get a single execution by runId
router.get("/:runId", getExecutionByRunId);

// Update an execution
router.put("/:runId", updateExecution);

export default router;

