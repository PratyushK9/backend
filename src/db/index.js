import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    // Connect to MongoDB using environment variable + DB_NAME
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
      useNewUrlParser: true, // recommended options for mongoose connection
      useUnifiedTopology: true,
    });

    console.log(`\nMongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure code
  }
};

export default connectDB;
