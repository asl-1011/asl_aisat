import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../src/utils/db.js"; // Correct function name
import Team from "../src/models/team.js";
import Player from "../src/models/Player.js";
import Match from "../src/models/Match.js"; // Removed duplicate import

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables **BEFORE** connecting to MongoDB
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function seedDatabase() {
  try {
    await connectDB(); // Correct function call
    console.log("✅ Connected to MongoDB. Seeding data...");

    // Clear existing data
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Match.deleteMany({});
    console.log("🗑️ Cleared existing data.");

    // Sample players
    const players = await Player.insertMany([
      { name: "Player 1", position: "Forward", profilePic: "player1.png", stats: { goals: 5, assists: 3 } },
      { name: "Player 2", position: "Midfielder", profilePic: "player2.png", stats: { goals: 2, assists: 4 } },
      { name: "Player 3", position: "Goalkeeper", profilePic: "player3.png", stats: { saves: 10 } }
    ]);

    console.log("✅ Players seeded:", players);

    // Sample teams
    const teams = await Team.insertMany([
      {
        team_name: "Team Alpha",
        team_logo: "team1-logo.png",
        manager: "Coach A",
        players: players.map((p) => p._id),
        matches: []
      },
      {
        team_name: "Team Beta",
        team_logo: "team2-logo.png",
        manager: "Coach B",
        players: [],
        matches: []
      }
    ]);

    console.log("✅ Teams seeded:", teams);

    // Sample match
    const match = await Match.create({
      team1: teams[0]._id,
      team2: teams[1]._id,
      score: "2-1",
      status: "Finished",
      description: "Exciting match between Team Alpha and Team Beta",
      playersTeam1: teams[0].players,
      playersTeam2: []
    });

    console.log("✅ Match seeded:", match);

    // Update teams with match data
    await Team.findByIdAndUpdate(teams[0]._id, {
      $push: { matches: { match_id: match._id, opponent: teams[1]._id, team_score: 2, opponent_score: 1 } }
    });

    await Team.findByIdAndUpdate(teams[1]._id, {
      $push: { matches: { match_id: match._id, opponent: teams[0]._id, team_score: 1, opponent_score: 2 } }
    });

    console.log("✅ Teams updated with match results.");
    console.log("🎉 Database seeding complete!");

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
