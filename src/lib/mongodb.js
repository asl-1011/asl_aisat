import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing from environment variables!");
}

// Global cache to prevent multiple connections
let cached = global.mongoose || { conn: null, promise: null, gfs: null };

export const connectDB = async () => {
  if (cached.conn) {
    console.info("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.info("⏳ Connecting to MongoDB...");

    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => {
        console.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);

        // Setup GridFSBucket
        const db = mongoose.connection.db;
        cached.gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise in case of failure
    throw error;
  }

  return cached.conn;
};

// Export GridFSBucket
export const getGFS = () => {
  if (!cached.gfs) {
    throw new Error("❌ GridFSBucket is not initialized!");
  }
  return cached.gfs;
};

// Store globally to prevent multiple reconnections
global.mongoose = cached;
// Export native MongoDB GridFSBucket instance directly
export const getBucket = () => {
  if (!cached.conn) {
    throw new Error("❌ No MongoDB connection available to get bucket");
  }

  const db = mongoose.connection.db;
  return new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
};
