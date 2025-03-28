import mongoose from "mongoose";

const FantasyPlayerSchema = new mongoose.Schema(
  {
    player_uid: { type: String, required: true, unique: true },
    player_team_id: { type: String, required: true },
    full_name: { type: String, required: true }, 
    team_name: { type: String, required: true }, 
    position: { type: String, required: true },   // New field for player position
    jersey: { type: String, required: true },     // New field for jersey number
    salary: { type: Number, required: true },     // New field for player's salary
    total_points: { type: Number, default: 0 },   // Total points (existing)
    goals: { type: Number, default: 0 },          // New field for goals scored
    player_status: { type: Number, default: 0 },
    updated_at: { type: Date, default: Date.now },
    weekly_scores: [
      {
        week: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        season_game_uid: { type: String, default: null },
      },
    ],
  },
  { collection: "fantasy_players" } // Explicitly set collection name
);

// Prevent OverwriteModelError
export default mongoose.models.FantasyPlayer ||
  mongoose.model("FantasyPlayer", FantasyPlayerSchema);
