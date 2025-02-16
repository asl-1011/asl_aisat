"use server";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Match from "@/models/Match";
import Player from "@/models/Player"; // Ensure Player model is registered

export async function GET() {
  try {
    await connectToDatabase();

    const matches = await Match.find({})
      .populate({
        path: "playersTeam1",
        model: Player, // Explicitly specify the Player model
        select: "name position profilePic stats",
      })
      .populate({
        path: "playersTeam2",
        model: Player, // Explicitly specify the Player model
        select: "name position profilePic stats",
      });

    return NextResponse.json(matches, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      team1,
      team2,
      team1Logo,
      team2Logo,
      score,
      status,
      description,
      playersTeam1 = [],
      playersTeam2 = [],
    } = body;

    // Validate required fields
    if (!team1 || !team2 || !status || !description) {
      return NextResponse.json(
        { error: "Missing required fields: team1, team2, status, or description" },
        { status: 400 }
      );
    }

    // Ensure player ObjectIds exist in the database before adding them
    const existingPlayersTeam1 = await Player.find({ _id: { $in: playersTeam1 } });
    const existingPlayersTeam2 = await Player.find({ _id: { $in: playersTeam2 } });

    const newMatch = new Match({
      team1,
      team2,
      team1Logo,
      team2Logo,
      score,
      status,
      description,
      playersTeam1: existingPlayersTeam1.map((p) => p._id),
      playersTeam2: existingPlayersTeam2.map((p) => p._id),
    });

    await newMatch.save();

    return NextResponse.json({ message: "✅ Match Added Successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error adding match:", error);
    return NextResponse.json(
      { error: "Failed to add match", details: error.message },
      { status: 500 }
    );
  }
}
