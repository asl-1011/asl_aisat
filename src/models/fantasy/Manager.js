import mongoose from "mongoose";

const ManagerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String},
  team: { type: String},
  budget_spent: { type: Number, default: 0 },
  budget_balance: { type: Number, default: 100 }, // Default budget
  win_percentage: { type: Number, default: 0 },
  match_win: { type: Number, default: 0 },
  cover_pic: { type: String, default: null },
  profile_pic: { type: String, default: null },
  profilePicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "uploads.files", // Reference to profile picture in GridFS
    required: false 
  },
  coverPicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "uploads.files", // Reference to cover picture in GridFS
    required: false 
  },
  manager_rank: { type: Number, default: 1000 },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  createdAt: { type: Date, default: Date.now },
});

const Manager = mongoose.models.Manager || mongoose.model("Manager", ManagerSchema);
export default Manager;
