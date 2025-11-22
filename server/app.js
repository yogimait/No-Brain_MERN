import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import workflowRoutes from "./src/routes/workflow.routes.js";
import executionRoutes from "./src/routes/execution.routes.js";
import orchestratorRoutes from './src/routes/orchestrator.routes.js';

import authRoutes from "./src/routes/auth.routes.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route declarations
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);
// app.use("/api/users", userRoutes);

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "NoBrain API is running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };

