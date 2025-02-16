import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  team1Logo: { type: String, required: true },
  team2Logo: { type: String, required: true },
  score: { type: String, default: "" },
  status: { type: String, required: true, enum: ["live", "recent", "upcoming"] },
  description: { type: String, required: true },
  playersTeam1: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // Players of Team 1
  playersTeam2: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // Players of Team 2
});

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
