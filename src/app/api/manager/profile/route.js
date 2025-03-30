"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import Manager from "@/models/fantasy/Manager.js";
import Player from "@/models/fantasy/FantasyPlayer.js";
import { connectDB } from "@/lib/mongodb";

// ✅ Custom Error Classes
class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
  }
}

class BadRequestError extends Error {
  constructor(message = "Bad Request") {
    super(message);
    this.name = "BadRequestError";
    this.status = 400;
  }
}

class InternalServerError extends Error {
  constructor(message = "Internal Server Error") {
    super(message);
    this.name = "InternalServerError";
    this.status = 500;
  }
}

// ✅ Utility: Handle Error Responses
const handleErrorResponse = (error) => {
  const status = error.status || 500;
  return NextResponse.json({ success: false, message: error.message }, { status });
};

// ✅ Verify Session and Extract User Email
const getUserEmailFromSession = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) throw new UnauthorizedError("No session found");

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.email;
  } catch (error) {
    console.error("❌ Session Verification Failed:", error);
    throw new UnauthorizedError("Invalid or expired session");
  }
};

// ✅ Fetch or Create Manager Data
const fetchOrCreateManagerAndPlayers = async (email) => {
  try {
    await connectDB();
    let manager = await Manager.findOne({ email });

    if (!manager) {
      console.log("📌 No manager found. Creating default profile...");
      manager = await Manager.create({
        email,
        name: "New Manager",
        team: "My Fantasy Team",
        budget_spent: 0,
        budget_balance: 15, // Initial budget
        win_percentage: 0,
        match_win: 0,
        cover_pic: null,
        profile_pic: null,
        manager_rank: 1000,
        players: [],
      });
    }

    console.log("📌 Existing Manager Data:", manager);
    const players = await Player.find({ _id: { $in: manager.players } });

    return { manager, players };
  } catch (error) {
    console.error("❌ Error in fetchOrCreateManagerAndPlayers:", error);
    throw new InternalServerError("Database operation failed");
  }
};

// ✅ PATCH: Update Manager (Profile, Add/Remove Players)
export async function PATCH(req) {
  try {
    const email = await getUserEmailFromSession();
    console.log("📌 Updating Profile for:", email);

    // ✅ Parse Request Body
    const updates = await req.json();
    console.log("🔹 Update Data:", updates);

    await connectDB();
    const manager = await Manager.findOne({ email });
    if (!manager) throw new UnauthorizedError("Manager profile not found");

    // ✅ Handle Player Addition
    if (updates.addPlayer) {
      const player = await Player.findById(updates.addPlayer);
      if (!player) throw new BadRequestError("Invalid player ID");

      // 🚀 Check if player is already in the manager’s team
      if (manager.players.includes(player._id)) {
        throw new BadRequestError("Player already in your team");
      }

      // 🚀 Check if the manager has enough budget
      if (manager.budget_balance < player.salary) {
        throw new BadRequestError("Not enough budget to buy this player");
      }

      // ✅ Update Manager's Team & Budget
      manager.players.push(player._id);
      manager.budget_balance -= player.salary;
      manager.budget_spent += player.salary;
      console.log(`✅ Player ${player.full_name} added to ${manager.name}'s team`);
    }

    // ✅ Handle Player Removal
    if (updates.removePlayer) {
      const playerIndex = manager.players.indexOf(updates.removePlayer);
      if (playerIndex === -1) {
        throw new BadRequestError("Player not found in your team");
      }

      const removedPlayer = await Player.findById(updates.removePlayer);
      if (!removedPlayer) throw new BadRequestError("Invalid player ID");

      // ✅ Update Manager's Team & Budget
      manager.players.splice(playerIndex, 1);
      manager.budget_balance += removedPlayer.salary;
      manager.budget_spent -= removedPlayer.salary;
      console.log(`✅ Player ${removedPlayer.full_name} removed from ${manager.name}'s team`);
    }

    // ✅ Handle Other Profile Updates
    const allowedFields = ["name", "team", "cover_pic", "profile_pic"];
    for (const key in updates) {
      if (allowedFields.includes(key)) {
        manager[key] = updates[key] || null;
      }
    }

    await manager.save();
    console.log("✅ Profile Updated:", updates);
    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("❌ Profile Update Error:", error.message || error);
    return handleErrorResponse(error);
  }
}

// ✅ GET: Fetch Manager Profile
export async function GET() {
  try {
    const email = await getUserEmailFromSession();
    console.log("📌 Fetching or Creating Manager for:", email);

    const { manager, players } = await fetchOrCreateManagerAndPlayers(email);
    return NextResponse.json({
      name: manager.name,
      email: manager.email,
      team: manager.team,
      budgetSpent: manager.budget_spent,
      budgetBalance: manager.budget_balance,
      winPercentage: manager.win_percentage,
      matchWin: manager.match_win,
      profilePicId: manager.profilePicId || null,
      coverPicId: manager.coverPicId || null,
      coverPic: `/api/manager/profile/images/${manager.coverPicId}` || null,
      profilePic: `/api/manager/profile/images/${manager.profilePicId}` || null,
      managerRank: manager.manager_rank,
      players: players.map((player) => ({
        id: player._id.toString(),
        name: player.full_name || "Unknown",
        position: player.position || "Unknown",
        profilePic: player.jersey || null,
        price: player.salary || 0,
        points: player.total_points || 0,
        goals: player.goals || 0,
      })),
    });
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error.message || error);
    return handleErrorResponse(error);
  }
}
