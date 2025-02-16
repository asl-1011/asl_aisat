import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  team_name: { type: String, required: true, unique: true },
  team_logo: { type: String, required: true }, // Stores filename or URL
  manager: { type: String, required: true }, // Coach/Manager name
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // List of player IDs
  matches: [
    {
      match_id: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true }, // Match ID
      opponent: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }, // Opponent team ID
      team_score: { type: Number, required: true }, // This team's score
      opponent_score: { type: Number, required: true }, // Opponent's score
    },
  ],
});

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
