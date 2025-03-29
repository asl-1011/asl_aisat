import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: "Match" }, // Reference Match
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },  // Reference Opponent Team
  team_score: { type: Number, default: 0 },
  opponent_score: { type: Number, default: 0 }
});

const TeamSchema = new mongoose.Schema({
  team_name: { type: String, required: true },
  team_logo: { type: String, required: true },
  manager: { type: String, required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // Reference Players
  matches: [MatchSchema] // Embedded Matches
});

// Ensure model registration
export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
