import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const maxRetries = 5;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
      return;
    } catch (error) {
      console.log(`❌ Mongo Error (attempt ${i}/${maxRetries}):`, error.message);
      if (i < maxRetries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise((res) => setTimeout(res, 5000));
      } else {
        console.log("❌ All retry attempts failed. Server is running but DB is not connected.");
      }
    }
  }
};

export default connectDB;