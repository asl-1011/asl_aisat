import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";

export const GET = async () => {
    await connectDB();
    
    try {
        const players = await Player.find({});
        return new Response(JSON.stringify(players), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error fetching players" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
