import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Match from "@/models/Match";
import Team from "@/models/team";
import Player from "@/models/Player";

export async function GET(req) {
  try {
    await connectDB();
    const matchId = new URL(req.url).searchParams.get("matchId");

    const query = matchId
      ? Match.findById(matchId)
          .populate({
            path: "team1 team2",
            model: Team,
            select: "team_name team_logo manager players",
            populate: {
              path: "players",
              model: Player,
              select: "name position profilePic stats"
            }
          })
      : Match.find({})
          .populate({ path: "team1 team2", model: Team, select: "team_name team_logo" })
          .select("team1 team2 team1_score team2_score status description");

    return NextResponse.json(await query.exec(), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches", details: error.message }, { status: 500 });
  }
}
