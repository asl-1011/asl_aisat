import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Match from "../src/models/Match.js";
import connectDB from "../src/utils/db.js";

// Fix __dirname issue in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const sampleMatches = [
  {
    team1: "Warriors FC",
    team2: "Phoenix United",
    team1Logo:
      "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    team2Logo:
      "https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    score: "2 - 1",
    status: "recent",
    description: "Today 15:00",
    players: [],
  },
  {
    team1: "Royal Eagles",
    team2: "Storm City",
    team1Logo:
      "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    team2Logo:
      "https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    score: "0 - 0",
    status: "upcoming",
    description: "Today 18:00",
    players: [],
  },
  {
    team1: "Titans SC",
    team2: "Victory FC",
    team1Logo:
      "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    team2Logo:
      "https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    score: "",
    status: "live",
    description: "Live now",
    players: [],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB(); // Connect to MongoDB

    console.log("🗑 Clearing existing match data...");
    await Match.deleteMany(); // Clear existing data

    console.log("🚀 Inserting sample match data...");
    await Match.insertMany(sampleMatches);

    console.log("✅ Sample data inserted successfully!");
    mongoose.connection.close(); // Close connection after inserting
  } catch (error) {
    console.error("❌ Error inserting data:", error);
    mongoose.connection.close();
  }
};

// Run the function
seedDatabase();
