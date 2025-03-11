import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Match from "@/models/Match";
import Team from "@/models/team";

// Fetch matches (all or by ID)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    let matches;
    if (matchId) {
      matches = await Match.findById(matchId)
        .populate({
          path: "team1 team2",
          model: Team,
          select: "team_name team_logo manager players",
        })
        .exec();
      if (!matches) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    } else {
      matches = await Match.find({})
        .populate({ path: "team1 team2", model: Team, select: "team_name team_logo" })
        .select("team1 team2 team1_score team2_score status description match_date location")
        .exec();
    }

    return NextResponse.json(matches, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

// Add a new match
export async function POST(req) {
    try {
      await connectDB();
      const { team1, team2, description, status, team1_score, team2_score } = await req.json();
  
      // Validation
      if (!team1 || !team2 || !status) {
        console.error("❌ Missing required fields");
        return NextResponse.json({ error: "Both teams and status are required" }, { status: 400 });
      }
      if (team1 === team2) {
        console.error("❌ Team selection error: A team cannot play against itself.");
        return NextResponse.json({ error: "A team cannot play against itself" }, { status: 400 });
      }
  
      // Check if teams exist
      const existingTeams = await Team.find({ _id: { $in: [team1, team2] } });
      if (existingTeams.length !== 2) {
        console.error("❌ Invalid team selection: One or both teams do not exist.");
        return NextResponse.json({ error: "Invalid team selection" }, { status: 400 });
      }
  
      // Set scores only if the match is not upcoming
      const matchData = {
        team1,
        team2,
        description,
        status,
        team1_score: status === "Upcoming" ? null : team1_score,
        team2_score: status === "Upcoming" ? null : team2_score,
      };
  
      // Create new match
      const newMatch = new Match(matchData);
      await newMatch.save();
  
      console.log("✅ Match created successfully:", newMatch);
  
      return NextResponse.json({ message: "Match created successfully", match: newMatch }, { status: 201 });
    } catch (error) {
      console.error("❌ Server Error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  
  
    
// Delete a match by ID
export async function DELETE(req) {
    try {
      await connectDB();
      
      const { searchParams } = new URL(req.url);
      const matchId = searchParams.get("matchId"); // ✅ Extract matchId from query
  
      if (!matchId) {
        return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
      }
  
      console.log("Deleting Match ID:", matchId); // Debugging
  
      const deletedMatch = await Match.findByIdAndDelete(matchId);
      if (!deletedMatch) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Match deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("❌ Error deleting match:", error);
      return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
    }
  }
  