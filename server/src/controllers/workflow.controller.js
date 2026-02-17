import { Workflow } from "../models/workflow.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a new workflow
const createWorkflow = asyncHandler(async (req, res) => {
  const { name, graph, ownerId, isPublic, description, platform } = req.body;

  // Validate required fields
  if (!name || !graph || !ownerId) {
    throw new ApiError(400, "Name, graph, and ownerId are required");
  }

  // Validate graph structure (basic check)
  if (!graph.nodes || !Array.isArray(graph.nodes)) {
    throw new ApiError(400, "Graph must contain a nodes array");
  }

  const workflow = await Workflow.create({
    name,
    graph,
    ownerId,
    isPublic: isPublic || false,
    description,
    platform: platform || 'legacy',
  });

  return res
    .status(201)
    .json(new ApiResponse(201, workflow, "Workflow created successfully"));
});

// Get all workflows (with optional filtering)
const getAllWorkflows = asyncHandler(async (req, res) => {
  const { ownerId, isPublic, search } = req.query;
  const query = {};

  // Filter by owner if provided
  if (ownerId) {
    query.ownerId = ownerId;
  }

  // Filter public templates
  if (isPublic !== undefined) {
    query.isPublic = isPublic === "true";
  }

  // Search by name if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const workflows = await Workflow.find(query)
    // .populate("ownerId", "username email") // User model not implemented yet
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, workflows, "Workflows retrieved successfully"));
});

// Get a single workflow by ID
const getWorkflowById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workflow = await Workflow.findById(id);
  // .populate("ownerId", "username email") // User model not implemented yet

  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, workflow, "Workflow retrieved successfully"));
});

// Update a workflow
const updateWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, graph, isPublic, description } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (graph !== undefined) {
    // Validate graph structure
    if (!graph.nodes || !Array.isArray(graph.nodes)) {
      throw new ApiError(400, "Graph must contain a nodes array");
    }
    updateData.graph = graph;
  }
  if (isPublic !== undefined) updateData.isPublic = isPublic;
  if (description !== undefined) updateData.description = description;

  const workflow = await Workflow.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  // .populate("ownerId", "username email") // User model not implemented yet

  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, workflow, "Workflow updated successfully"));
});

// Delete a workflow
const deleteWorkflow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workflow = await Workflow.findByIdAndDelete(id);

  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Workflow deleted successfully"));
});

// Search workflows by name
const searchWorkflows = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new ApiError(400, "Search query is required");
  }

  const workflows = await Workflow.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  })
    // .populate("ownerId", "username email") // User model not implemented yet
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, workflows, "Search results retrieved successfully"));
});

// Get public templates
const getPublicTemplates = asyncHandler(async (req, res) => {
  const workflows = await Workflow.find({ isPublic: true })
    // .populate("ownerId", "username email") // User model not implemented yet
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, workflows, "Public templates retrieved successfully"));
});

export {
  createWorkflow,
  getAllWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  searchWorkflows,
  getPublicTemplates,
};

