import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing from environment variables!");
}

// Global cache to prevent multiple connections
let cached = global.mongoose || { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) {
    console.info("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.info("⏳ Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch((error) => {
      console.error("❌ MongoDB Connection Error:", error);
      process.exit(1);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// Store globally to prevent multiple reconnections
global.mongoose = cached;
