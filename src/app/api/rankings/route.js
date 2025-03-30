"use server";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/team"; // Ensure the correct path to your Team model

export async function GET() {
  try {
    await connectDB();
    
    const teams = await Team.find()
      .select("team_name team_logo wins losses draws goals_scored goals_conceded")
      .lean();
    
    // Process team data and calculate points
    const rankings = teams.map(team => ({
      team_id: team._id,
      team_name: team.team_name,
      team_logo: team.team_logo?.startsWith("http")
        ? team.team_logo
        : `/api/teams/logo/${team.team_logo}`, // Correcting logo handling
      wins: team.wins,
      draws: team.draws,
      losses: team.losses,
      goals_scored: team.goals_scored,
      goals_conceded: team.goals_conceded,
      points: team.wins * 3 + team.draws * 1,
    })).sort((a, b) => b.points - a.points); // Sort by points descending

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Error fetching team rankings:", error);
    return NextResponse.json({ error: "Failed to fetch team rankings" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
