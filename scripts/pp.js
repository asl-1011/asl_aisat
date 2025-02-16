import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Player from "../src/models/Player.js";
import connectDB from "../src/utils/db.js";

// Fix __dirname issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const samplePlayers = [
  {
    name: "John Doe",
    position: "Forward",
    team: null, // Replace with a valid team ObjectId
    profilePic: "https://example.com/john_doe.jpg",
    stats: { goals: 10, assists: 5, matchesPlayed: 20 },
  },
  {
    name: "Michael Smith",
    position: "Midfielder",
    team: null, // Replace with a valid team ObjectId
    profilePic: "https://example.com/michael_smith.jpg",
    stats: { goals: 3, assists: 7, matchesPlayed: 15 },
  },
];

const seedPlayers = async () => {
  try {
    await connectDB(); // Connect to MongoDB

    console.log("🗑 Clearing existing player data...");
    await Player.deleteMany(); // Clear existing data

    console.log("🚀 Inserting sample player data...");
    await Player.insertMany(samplePlayers);

    console.log("✅ Sample player data inserted successfully!");
    mongoose.connection.close(); // Close connection after inserting
  } catch (error) {
    console.error("❌ Error inserting player data:", error);
    mongoose.connection.close();
  }
};

// Run the function
seedPlayers();
