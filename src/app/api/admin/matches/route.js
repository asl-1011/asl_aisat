import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Match from "@/models/Match";
import Team from "@/models/team";
import Player from "@/models/Player";

// Fetch matches (all or by ID)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (matchId) {
      const match = await Match.findById(matchId)
        .populate({
          path: "team1 team2",
          model: Team,
          select: "team_name team_logo players",
        })
        .exec();

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      // Get all players from both teams
      const [team1Players, team2Players] = await Promise.all([
        Player.find({ _id: { $in: match.team1.players } }).select("name profilePic"),
        Player.find({ _id: { $in: match.team2.players } }).select("name profilePic"),
      ]);

      // Helper to tag players based on match scorers for THIS match only
      const tagPlayers = (players, matchScorers = []) => {
        const scorerMap = {};

        matchScorers.forEach(({ playerId, goals = 0, yellow = false, red = false }) => {
          scorerMap[playerId.toString()] = {
            goals,
            yellow_card: yellow,
            red_card: red,
          };
        });

        return players
          .map((player) => {
            const stats = scorerMap[player._id.toString()] || {};
            return {
              ...player.toObject(),
              goals: stats.goals || 0,
              yellow_card: stats.yellow_card || false,
              red_card: stats.red_card || false,
              hasEvent: !!scorerMap[player._id.toString()],
            };
          })
          .sort((a, b) => Number(b.hasEvent) - Number(a.hasEvent));
      };

      const matchData = {
        ...match.toObject(),
        team1_players: tagPlayers(team1Players, match.team1_scorers),
        team2_players: tagPlayers(team2Players, match.team2_scorers),
      };

      return NextResponse.json(matchData, { status: 200 });
    } else {
      // Return all matches (basic info only)
      const matches = await Match.find({})
        .populate({
          path: "team1 team2",
          model: Team,
          select: "team_name team_logo",
        })
        .select("team1 team2 status description match_date location")
        .exec();

      return NextResponse.json(matches, { status: 200 });
    }
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
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

// Add a new match
export async function POST(req) {
  try {
    await connectDB();
    const {
      team1,
      team2,
      description,
      status,
      team1_score,
      team2_score,
      team1_scorers = [],
      team2_scorers = [],
    } = await req.json();

    // Validate required fields
    if (!team1 || !team2 || !status || team1_score === undefined || team2_score === undefined) {
      console.error("❌ Missing required fields");
      return NextResponse.json({ error: "All fields except scorers are required" }, { status: 400 });
    }

    if (team1 === team2) {
      console.error("❌ A team cannot play against itself.");
      return NextResponse.json({ error: "A team cannot play against itself" }, { status: 400 });
    }

    // Validate teams exist
    const teams = await Team.find({ _id: { $in: [team1, team2] } });
    if (teams.length !== 2) {
      console.error("❌ One or both teams do not exist.");
      return NextResponse.json({ error: "Invalid team selection" }, { status: 400 });
    }

    // Prepare match data
    const matchData = {
      team1,
      team2,
      description,
      status,
      team1_score: status === "Upcoming" ? null : team1_score,
      team2_score: status === "Upcoming" ? null : team2_score,
      team1_scorers: status === "Upcoming" ? [] : team1_scorers,
      team2_scorers: status === "Upcoming" ? [] : team2_scorers,
    };

    const newMatch = new Match(matchData);
    await newMatch.save();

    // Optional: update player stats
    if (status !== "Upcoming") {
      await updateTeamStats(team1, team2, team1_score, team2_score);
      const allScorers = [...team1_scorers, ...team2_scorers];
      for (const scorer of allScorers) {
        const updates = {};
        if (scorer.goals) updates.goals = scorer.goals;
        if (scorer.yellow) updates.yellow_cards = 1;
        if (scorer.red) updates.red_cards = 1;

        if (Object.keys(updates).length > 0) {
          const updateOps = Object.entries(updates).reduce(
            (acc, [key, val]) => {
              acc.$inc[key] = val;
              return acc;
            },
            { $inc: {} }
          );
          await Player.findByIdAndUpdate(scorer.playerId, updateOps);
        }
      }
    }

    console.log("✅ Match created successfully:", newMatch);
    return NextResponse.json(newMatch, { status: 201 });

  } catch (error) {
    console.error("❌ Error creating match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function updateTeamStats(team1Id, team2Id, team1_score, team2_score, matchId) {
  const team1 = await Team.findById(team1Id);
  const team2 = await Team.findById(team2Id);
  if (!team1 || !team2) return;

  // Update goals
  team1.goals_scored += team1_score;
  team1.goals_conceded += team2_score;
  team2.goals_scored += team2_score;
  team2.goals_conceded += team1_score;

  // Result outcome
  if (team1_score > team2_score) {
    team1.wins += 1;
    team2.losses += 1;
  } else if (team1_score < team2_score) {
    team2.wins += 1;
    team1.losses += 1;
  } else {
    team1.draws += 1;
    team2.draws += 1;
  }

  // Push match result to match history
  team1.matches.push({ match_id: matchId, opponent: team2Id, team_score: team1_score, opponent_score: team2_score });
  team2.matches.push({ match_id: matchId, opponent: team1Id, team_score: team2_score, opponent_score: team1_score });

  await team1.save();
  await team2.save();
}

async function updatePlayerStats(scorers) {
  for (const entry of scorers) {
    const { playerId, goals, yellow, red } = entry;
    const player = await Player.findById(playerId);
    if (!player) continue;

    player.stats.goals += goals || 0;
    player.stats.matchesPlayed += 1;

    // You can extend schema to track yellow/red cards if needed
    await player.save();
  }
}