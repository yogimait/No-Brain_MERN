import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Configure dotenv
dotenv.config();
import workflowRoutes from "./src/routes/workflow.routes.js";
import executionRoutes from "./src/routes/execution.routes.js";
import orchestratorRoutes from './src/routes/orchestrator.routes.js';
import nlpRoutes from './src/routes/nlp.routes.js';
// import userRoutes from './src/routes/user.routes.js';
import authRoutes from "./src/routes/auth.routes.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

// CORS configuration - parse comma-separated origins with trim and validation
const parseOrigins = () => {
    const corsOrigin = process.env.CORS_ORIGIN || '';
    const origins = corsOrigin
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0);

    // In development, allow localhost if not already included
    if (process.env.NODE_ENV !== 'production') {
        const localhostOrigins = ['http://localhost:5173', 'http://localhost:3000'];
        localhostOrigins.forEach(lo => {
            if (!origins.includes(lo)) origins.push(lo);
        });
    }

    return origins;
};

const allowedOrigins = parseOrigins();

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route declarations
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);
// app.use("/api/users", userRoutes);

// Health check route (enhanced for production monitoring)
app.get("/api/health", (req, res) => {
    // Map mongoose connection states
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const dbState = dbStates[mongoose.connection.readyState] || 'unknown';

    res.status(200).json({
        success: true,
        service: "NoBrain API",
        status: "operational",
        geminiConfigured: !!process.env.GEMINI_API_KEY,
        database: dbState,
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

