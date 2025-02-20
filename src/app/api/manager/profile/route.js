"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

// ✅ Custom Error  Handling
class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
  }
}

class NotFoundError extends Error {
  constructor(message = "Not Found") {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
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
  } catch {
    throw new UnauthorizedError("Invalid or expired session");
  }
};

// ✅ Fetch Manager Data (Including Players)
const fetchManagerAndPlayers = async (email) => {
  const managerSnap = await adminDb
    .collection("managers")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (managerSnap.empty) throw new NotFoundError("Manager not found");

  const managerDoc = managerSnap.docs[0];
  const manager = { id: managerDoc.id, ...managerDoc.data() };

  console.log("📌 Manager Data:", JSON.stringify(manager, null, 2)); // 🔹 Log Manager Data

  if (!Array.isArray(manager.players) || manager.players.length === 0) {
    return { manager, players: [] };
  }

  // ✅ Optimize Query: Batch Fetch Players using IDs
  const playersQuery = adminDb.collection("players").where("__name__", "in", manager.players);
  const playersSnap = await playersQuery.get();

  const players = playersSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log("📌 Players Data:", JSON.stringify(players, null, 2)); // 🔹 Log Players Data

  return { manager, players };
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
  coverPic: manager.cover_pic,
  profilePic: manager.profile_pic,
  managerRank: manager.manager_rank,
  players: players.map(({ id, name, position, profile_pic, price, points, goals }) => ({
    id,
    name,
    position,
    profilePic: profile_pic,
    price,
    points,
    goals,
  })),
});

// ✅ GET API Route
export async function GET() {
  try {
    const email = await getUserEmailFromSession();
    const { manager, players } = await fetchManagerAndPlayers(email);
    return NextResponse.json(formatManagerProfile(manager, players));
  } catch (error) {
    console.error("Profile Fetch Error:", error.message || error);
    return handleErrorResponse(error);
  }
}
