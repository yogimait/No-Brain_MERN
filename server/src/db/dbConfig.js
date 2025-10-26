import mongoose from "mongoose"
import { DB_NAME } from "../../constant.js"
const connectDB = async ()=>{
    try {
        const connectionInstance =await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`DATABASE CONNECTED SUCCESSFULLY with db host ${connectionInstance.Connection.host}`)
    } catch (error) {
        console.log(`process.env.${process.env.MONGODB_URI}/${DB_NAME}`);
        
        console.log("DATABASE CONNECTION FAILED",error)
        process.exit(1);
    }
}

export {connectDB}