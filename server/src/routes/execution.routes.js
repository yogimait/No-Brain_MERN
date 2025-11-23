import express from "express";
import {
  createExecution,
  getExecutionsByWorkflow,
  getExecutionByRunId,
  updateExecution,
  getAllExecutions,
  deleteExecution,
} from "../controllers/execution.controller.js";

const router = express.Router();

// Create a new execution log
router.post("/", createExecution);

// Get all executions (with optional query params: workflowId, status, limit, skip)
router.get("/", getAllExecutions);

// Get all executions for a specific workflow
router.get("/workflow/:workflowId", getExecutionsByWorkflow);

// Update an execution
router.put("/:runId", updateExecution);

// Delete an execution by runId (must come before GET /:runId to avoid route conflicts)
router.delete("/:runId", deleteExecution);

// Get a single execution by runId (must come last to avoid conflicts)
router.get("/:runId", getExecutionByRunId);

export default router;

