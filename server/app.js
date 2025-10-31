import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
// Use ES module imports (paths adjusted to `src/routes`)
import orchestratorRoutes from './src/routes/orchestrator.routes.js'

 const app = express();

// Middleware
 app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
 }))
 app.use(express.json({limit:"20kb"}))
 app.use(express.urlencoded({extended:true,limit:"20kb"}));
 app.use(express.static("public"));
 app.use(cookieParser())


// routes import
import userRoute from './src/routes/user.routes.js'
app.use('/api/orchestrator', orchestratorRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'NoBrain API is running', version: '1.0.0' });
});

//routes declaration
app.use("/api/v1/users",userRoute)

// Error handler (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


 export {app}