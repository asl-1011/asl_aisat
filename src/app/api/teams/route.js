import { connectDB } from "@/lib/mongodb";
import Team from "@/models/team";
import Player from "@/models/Player";

export async function GET(req) {
    try {
        await connectDB();

        const teams = await Team.find({})
            .populate({
                path: "players",
                model: Player, // Explicitly reference Player model
                select: "name position profilePic stats team", // Ensure team is included
            });

        return Response.json(teams, { status: 200 });
    } catch (error) {
        console.error("Error fetching teams:", error);
        return Response.json({ message: "Error fetching teams", error: error.message }, { status: 500 });
    }
}
