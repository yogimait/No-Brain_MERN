import { Execution } from "../models/execution.model.js";
import { Workflow } from "../models/workflow.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Helper function to generate unique runId
const generateRunId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `run_${timestamp}_${random}`;
};

// Create a new execution log
const createExecution = asyncHandler(async (req, res) => {
  const { workflowId, status, nodeLogs, duration, error, runId } = req.body;

  // Validate required fields
  if (!workflowId) {
    throw new ApiError(400, "Workflow ID is required");
  }

  // Verify workflow exists
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  // Generate unique runId if not provided
  const finalRunId = runId || generateRunId();

  const execution = await Execution.create({
    runId: finalRunId,
    workflowId,
    status: status || "pending",
    nodeLogs: nodeLogs || [],
    duration: duration || 0,
    error,
    completedAt: status === "completed" || status === "failed" || status === "cancelled" 
      ? new Date() 
      : null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, execution, "Execution log created successfully"));
});

// Get all executions for a workflow
const getExecutionsByWorkflow = asyncHandler(async (req, res) => {
  const { workflowId } = req.params;
  const { limit = 50, skip = 0 } = req.query;

  // Verify workflow exists
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  const executions = await Execution.find({ workflowId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Execution.countDocuments({ workflowId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        executions,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
      "Executions retrieved successfully"
    )
  );
});

// Get a single execution by runId
const getExecutionByRunId = asyncHandler(async (req, res) => {
  const { runId } = req.params;

  const execution = await Execution.findOne({ runId }).populate(
    "workflowId",
    "name"
  );

  if (!execution) {
    throw new ApiError(404, "Execution not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, execution, "Execution retrieved successfully"));
});

// Update an execution (useful for updating status during run)
const updateExecution = asyncHandler(async (req, res) => {
  const { runId } = req.params;
  const { status, nodeLogs, duration, error } = req.body;

  const updateData = {};
  if (status !== undefined) {
    updateData.status = status;
    // Set completedAt if execution finished
    if (status === "completed" || status === "failed" || status === "cancelled") {
      updateData.completedAt = new Date();
    }
  }
  if (nodeLogs !== undefined) updateData.nodeLogs = nodeLogs;
  if (duration !== undefined) updateData.duration = duration;
  if (error !== undefined) updateData.error = error;

  const execution = await Execution.findOneAndUpdate(
    { runId },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("workflowId", "name");

  if (!execution) {
    throw new ApiError(404, "Execution not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, execution, "Execution updated successfully"));
});

// Get all executions (with optional filtering)
const getAllExecutions = asyncHandler(async (req, res) => {
  const { workflowId, status, limit = 50, skip = 0 } = req.query;

  const query = {};
  if (workflowId) query.workflowId = workflowId;
  if (status) query.status = status;

  const executions = await Execution.find(query)
    .populate("workflowId", "name ownerId")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await Execution.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        executions,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
      "Executions retrieved successfully"
    )
  );
});

export {
  createExecution,
  getExecutionsByWorkflow,
  getExecutionByRunId,
  updateExecution,
  getAllExecutions,
};

