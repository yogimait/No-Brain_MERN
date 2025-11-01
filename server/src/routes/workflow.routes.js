import express from "express";
import {
  createWorkflow,
  getAllWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  searchWorkflows,
  getPublicTemplates,
} from "../controllers/workflow.controller.js";

const router = express.Router();

// Create a new workflow
router.post("/", createWorkflow);

// Get all workflows (with optional query params: ownerId, isPublic, search)
router.get("/", getAllWorkflows);

// Search workflows by name
router.get("/search", searchWorkflows);

// Get public templates
router.get("/templates", getPublicTemplates);

// Get a single workflow by ID
router.get("/:id", getWorkflowById);

// Update a workflow
router.put("/:id", updateWorkflow);

// Delete a workflow
router.delete("/:id", deleteWorkflow);

export default router;

