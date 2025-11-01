
import mongoose from "mongoose"
import dotenv from "dotenv"
import  app  from "./app.js";
// import { connectDB } from "./src/db/dbConfig.js";
dotenv.config();
const PORT = process.env.PORT ||3000;

// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log("DB connection Failed", error);
//   });


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Orchestrator API: http://localhost:${PORT}/api/orchestrator`);
});