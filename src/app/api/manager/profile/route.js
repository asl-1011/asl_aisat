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

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function GET(req) {
  try {
    // ✅ Await cookies before accessing its value
    const cookieStore = await cookies();
    const encryptedToken = cookieStore.get("auth_token")?.value;

    if (!encryptedToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Decrypt the token
    const accessToken = decrypt(encryptedToken);
    if (!accessToken) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // ✅ Get user session using decrypted access token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    // ✅ Fetch manager details from Supabase
    const { data: manager, error: managerError } = await supabase
      .from("managers")
      .select("*")
      .eq("email", user.email)
      .single();

    if (managerError || !manager) {
      return NextResponse.json({ success: false, message: "Manager not found" }, { status: 404 });
    }

    // ✅ Fetch players linked to this manager
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("manager_id", manager.id);

    if (playersError) {
      return NextResponse.json({ success: false, message: "Failed to fetch players" }, { status: 500 });
    }

    // ✅ Ensure players is always an array
    const managerProfile = {
      name: manager.name,
      email: manager.email,
      team: manager.team,
      budgetSpent: manager.budget_spent,
      budgetBalance: manager.budget_balance,
      winPercentage: manager.win_percentage,
      match_win: manager.match_win,
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
    };

    return NextResponse.json(managerProfile);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
