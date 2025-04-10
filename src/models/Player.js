import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    profilePic: { type: String, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }, // Ensure team reference
    stats: {
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        matchesPlayed: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
    },
});

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema);
