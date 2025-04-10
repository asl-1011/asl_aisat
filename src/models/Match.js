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

  team1_scorers: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, required: true },
      goals: { type: Number, default: 0 },
      yellow: { type: Boolean, default: false },
      red: { type: Boolean, default: false },
    }
  ],
  team2_scorers: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, required: true },
      goals: { type: Number, default: 0 },
      yellow: { type: Boolean, default: false },
      red: { type: Boolean, default: false },
    }
  ],

  poll: {
    votes1: { type: Number, default: 0 }, 
    votes2: { type: Number, default: 0 }, 
  },
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to calculate total votes
MatchSchema.virtual("poll.totalVotes").get(function () {
  return this.poll.votes1 + this.poll.votes2;
});

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
