import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import workflowRoutes from "./src/routes/workflow.routes.js";
import executionRoutes from "./src/routes/execution.routes.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));

 app.use(express.json({limit:"20kb"}))
 app.use(express.urlencoded({extended:true,limit:"20kb"}));
 app.use(express.static("public"));
app.use(cookieParser());

// Routes declaration
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

export { app };