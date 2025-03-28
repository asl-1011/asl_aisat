import { connectDB } from "@/lib/mongodb";
import FantasyPlayer from "@/models/fantasy/FantasyPlayer";

export async function GET(req) {
  await connectDB();

  try {
    const players = await FantasyPlayer.find({}, "full_name total_points salary player_team_id _id player_uid team_name").lean();
    
    return Response.json(players, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error fetching players", error: error.message }, { status: 500 });
  }
}
