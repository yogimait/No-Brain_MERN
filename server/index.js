import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./src/db/dbConfig.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${NODE_ENV})`);
    });
  })
  .catch((error) => {
    console.log("DB connection Failed", error);
    process.exit(1);
  });