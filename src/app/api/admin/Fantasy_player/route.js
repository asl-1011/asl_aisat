import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FantasyPlayer from "@/models/fantasy/FantasyPlayer";
import axios from "axios";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { league_id, sports_id, player_team_id, player_uid } = body;

    if (!league_id || !sports_id || !player_team_id || !player_uid) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const existingPlayer = await FantasyPlayer.findOne({ player_uid });
    if (existingPlayer) {
      return NextResponse.json({ success: false, message: "Player already exists" }, { status: 409 });
    }

    const { data } = await axios.post(
      "https://fantasy.indiansuperleague.com/fantasy/sl_roster/get_playercard_sl_master_data",
      { league_id, sports_id, player_team_id, player_uid }
    );

    const playerData = data?.data;
    if (!playerData) {
      return NextResponse.json({ success: false, message: "No player data found in API response" }, { status: 404 });
    }

    const newPlayer = new FantasyPlayer({
      player_uid: playerData.player_uid,
      player_name: playerData.full_name,
      full_name: playerData.full_name,
      player_team_id: playerData.player_team_id,
      team_name: playerData.team_name || playerData.player_team || "",
      jersey: parseInt(playerData.jersey?.match(/\d+/)?.[0]) || 0, // jersey number if extractable
      position: playerData.position || "NA",
      salary: parseFloat(playerData.salary) || 0,

      total_points: parseInt(playerData.total_points) || 0,
      player_status: parseInt(playerData.player_status) || 0,
      updated_at: new Date(),

      weekly_scores: (playerData.master_data || []).map((week) => ({
        week: parseInt(week.week) || 0,
        score: parseInt(week.score) || 0,
        season_game_uid: week.season_game_uid || null,
      })),
    });

    await newPlayer.save();

    return NextResponse.json({ success: true, message: "✅ Player created successfully", player: newPlayer });
  } catch (error) {
    console.error("❌ Error creating player:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
