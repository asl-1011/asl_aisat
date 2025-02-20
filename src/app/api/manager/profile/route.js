"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

// ✅ Custom Error Handling
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
    const managerSnap = await adminDb
      .collection("managers")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (managerSnap.empty) {
      console.log("📌 No manager found. Creating default profile...");

      // ✅ Default Manager Profile
      const defaultManager = {
        email,
        name: "New Manager",
        team: "My Fantasy Team",
        budget_spent: 0,
        budget_balance: 100, // Default budget
        win_percentage: 0,
        match_win: 0,
        cover_pic: null,
        profile_pic: null,
        manager_rank: 1000,
        players: [],
        createdAt: new Date(),
      };

      // ✅ Insert Default Profile
      const newManagerRef = await adminDb.collection("managers").add(defaultManager);
      defaultManager.id = newManagerRef.id;

      console.log("✅ New Manager Created:", defaultManager);
      return { manager: defaultManager, players: [] };
    }

    // ✅ If Manager Exists, Fetch Data
    const managerDoc = managerSnap.docs[0];
    const manager = { id: managerDoc.id, ...managerDoc.data() };

    console.log("📌 Existing Manager Data:", JSON.stringify(manager, null, 2));

    if (!Array.isArray(manager.players) || manager.players.length === 0) {
      return { manager, players: [] };
    }

    // ✅ Batch Fetch Players using IDs
    const playersQuery = adminDb.collection("players").where("__name__", "in", manager.players);
    const playersSnap = await playersQuery.get();

    const players = playersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("📌 Players Data:", JSON.stringify(players, null, 2));

    return { manager, players };
  } catch (error) {
    console.error("❌ Error in fetchOrCreateManagerAndPlayers:", error);
    throw new InternalServerError("Database operation failed");
  }
};

// ✅ Format Manager Profile for Response
const formatManagerProfile = (manager, players) => ({
  name: manager.name,
  email: manager.email,
  team: manager.team,
  budgetSpent: manager.budget_spent,
  budgetBalance: manager.budget_balance,
  winPercentage: manager.win_percentage,
  matchWin: manager.match_win,
  coverPic: manager.cover_pic || null,
  profilePic: manager.profile_pic || null,
  managerRank: manager.manager_rank,
  players: players.map(({ id, name, position, profile_pic, price, points, goals }) => ({
    id,
    name,
    position,
    profilePic: profile_pic || null,
    price,
    points,
    goals,
  })),
});

// ✅ Update Manager Profile
export async function PATCH(req) {
  try {
    const email = await getUserEmailFromSession();
    console.log("📌 Updating Profile for:", email);

    // ✅ Parse Request Body
    const updates = await req.json();
    console.log("🔹 Update Data:", updates);

    // ✅ Validate Update Fields
    const allowedFields = ["name", "team", "cover_pic", "profile_pic"];
    const updateData = {};
    for (const key in updates) {
      if (allowedFields.includes(key)) {
        updateData[key] = updates[key] || null; // Set null if empty
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError("No valid fields to update");
    }

    // ✅ Find Manager Record
    const managerSnap = await adminDb
      .collection("managers")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (managerSnap.empty) {
      throw new UnauthorizedError("Manager profile not found");
    }

    const managerDoc = managerSnap.docs[0];

    // ✅ Update Database
    await adminDb.collection("managers").doc(managerDoc.id).update(updateData);
    console.log("✅ Profile Updated:", updateData);

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("❌ Profile Update Error:", error.message || error);
    return handleErrorResponse(error);
  }
}

// ✅ GET API Route
export async function GET() {
  try {
    const email = await getUserEmailFromSession();
    console.log("📌 Fetching or Creating Manager for:", email);

    const { manager, players } = await fetchOrCreateManagerAndPlayers(email);
    return NextResponse.json(formatManagerProfile(manager, players));
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error.message || error);
    return handleErrorResponse(error);
  }
}
