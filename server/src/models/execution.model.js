import mongoose from "mongoose";

const nodeLogSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
  },
  nodeName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "running", "completed", "failed", "skipped"],
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
  },
  error: {
    type: String,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  nodeConfig: {
    type: mongoose.Schema.Types.Mixed,
    // Stores node configuration (credentials, AI model settings, etc.) saved from canvas
  },
});

const executionSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      required: [true, "Run ID is required"],
      unique: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: [true, "Workflow ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "cancelled"],
      default: "pending",
      required: true,
    },
    nodeLogs: {
      type: [nodeLogSchema],
      default: [],
    },
    duration: {
      type: Number, // Duration in milliseconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
executionSchema.index({ workflowId: 1, createdAt: -1 });
// Note: runId already has unique: true which creates an index automatically

export const Execution = mongoose.model("Execution", executionSchema);

