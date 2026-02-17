import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workflow name is required"],
      trim: true,
    },
    graph: {
      type: Object,
      required: [true, "Workflow graph is required"],
      // Contains nodes and edges JSON structure
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "User", // Will add User model later when auth is implemented
      required: [true, "Owner ID is required"],
    },
    // Phase-2: Platform field
    platform: {
      type: String,
      required: true,
      enum: ['legacy', 'n8n'],
      default: 'legacy', // Old workflows (Phase-1) default to "legacy"
    },
    isPublic: {
      type: Boolean,
      default: false, // For public templates
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster searches
workflowSchema.index({ name: "text", description: "text" });
workflowSchema.index({ ownerId: 1 });

export const Workflow = mongoose.model("Workflow", workflowSchema);
