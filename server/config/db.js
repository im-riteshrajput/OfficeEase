import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ MongoDB Connected"))
  } catch (error) {
    console.log("❌ Mongo Error:", error)
    process.exit(1);
  }
};

export default connectDB;