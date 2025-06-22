import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Backend is successfully connected to the MongoDB database");
  } catch (error) {
    console.log("Error connecting to MongoDB database", error);
    process.exit(1);
  }
};

export default connectDatabase;