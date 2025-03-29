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
              select: "name position profilePic stats",
            },
          })
      : Match.find({})
          .populate({
            path: "team1 team2",
            model: Team,
            select: "team_name team_logo",
          })
          .select("team1 team2 team1_score team2_score status description poll");

    return NextResponse.json(await query.exec(), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches", details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { matchId, vote, userId } = await req.json(); // userId added for vote tracking

    if (!matchId || !["votes1", "votes2"].includes(vote)) {
      return NextResponse.json({ error: "Invalid matchId or vote type" }, { status: 400 });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Prevent multiple votes by checking if userId exists in voters array
    if (match.voters.includes(userId)) {
      return NextResponse.json({ error: "You have already voted" }, { status: 403 });
    }

    // Update vote count & store user vote
    match.poll[vote] += 1;
    match.voters.push(userId);
    await match.save();

    return NextResponse.json({ message: "Vote registered successfully", poll: match.poll }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating vote:", error);
    return NextResponse.json({ error: "Failed to register vote", details: error.message }, { status: 500 });
  }
}
