"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/utils/aes"; // Import decryption utility

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// Initialize Supabase  
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const handleErrorResponse = (message, status = 500) => {
  return NextResponse.json({ success: false, message }, { status });
};

const fetchUserFromToken = async (encryptedToken) => {
  const accessToken = decrypt(encryptedToken);
  if (!accessToken) {
    throw new Error("Invalid token");
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    throw new Error("User not found");
  }
  return user;
};

const fetchManagerAndPlayers = async (email) => {
  const { data: manager, error: managerError } = await supabase
    .from("managers")
    .select("*")
    .eq("email", email)
    .single();

  if (managerError || !manager) {
    throw new Error("Manager not found");
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("manager_id", manager.id);

  if (playersError) {
    throw new Error("Failed to fetch players");
  }

  return { manager, players };
};

const mapManagerProfile = (manager, players) => ({
  name: manager.name,
  email: manager.email,
  team: manager.team,
  budgetSpent: manager.budget_spent,
  budgetBalance: manager.budget_balance,
  winPercentage: manager.win_percentage,
  match_win: manager.match_win,
  coverPic: manager.cover_pic,
  profilePic: manager.profile_pic,
  managerRank: manager.manager_rank,
  players: Array.isArray(players)
    ? players.map(player => ({
        name: player.name,
        position: player.position,
        profilePic: player.profile_pic,
        price: player.price,
        points: player.points,
        goals: player.goals,
      }))
    : [],
});

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const encryptedToken = cookieStore.get("auth_token")?.value;

    if (!encryptedToken) {
      return handleErrorResponse("Unauthorized", 401);
    }

    const user = await fetchUserFromToken(encryptedToken);

    const { manager, players } = await fetchManagerAndPlayers(user.email);

    const managerProfile = mapManagerProfile(manager, players);

    return NextResponse.json(managerProfile);
  } catch (error) {
    console.error("Profile Fetch Error:", error.message || error);
    const message = error.message || "Internal server error";
    return handleErrorResponse(message, 500);
  }
}
