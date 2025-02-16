import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  team1_score: { type: Number, default: 0 },
  team2_score: { type: Number, default: 0 },
  status: { type: String, required: true },
  description: { type: String },
  playersTeam1: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  playersTeam2: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
});

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
