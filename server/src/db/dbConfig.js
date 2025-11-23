import mongoose from "mongoose";
import { DB_NAME } from "../../constant.js";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set. Please add it to your .env file.");
    }

    let mongoUri = process.env.MONGODB_URI.trim();
    
    // Remove trailing slash if present
    if (mongoUri.endsWith('/')) {
      mongoUri = mongoUri.slice(0, -1);
    }
    
    // Extract base URI (protocol + host + port) - everything before the last '/'
    // Examples:
    // mongodb://localhost:27017/NoBrain -> mongodb://localhost:27017
    // mongodb://localhost:27017 -> mongodb://localhost:27017
    const urlPattern = /^(mongodb(?:\+srv)?:\/\/[^\/]+)/;
    const match = mongoUri.match(urlPattern);
    const baseUri = match ? match[1] : mongoUri;
    
    // Always use base URI + DB_NAME to ensure consistency
    mongoUri = `${baseUri}/${DB_NAME}`;

    const connectionInstance = await mongoose.connect(mongoUri);
    console.log(
      `✅ DATABASE CONNECTED SUCCESSFULLY: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.error(`❌ DATABASE CONNECTION FAILED`);
    console.error(`MONGODB_URI: ${process.env.MONGODB_URI ? '***set***' : 'NOT SET'}`);
    console.error(`DB_NAME: ${DB_NAME}`);
    console.error("Error:", error.message);
    process.exit(1);
  }
};

export {connectDB}