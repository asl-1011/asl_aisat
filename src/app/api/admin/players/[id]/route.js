import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import Player from "@/models/Player";
import Team from "@/models/team";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const gfs = getGFS();

        const { id } = params;

        const player = await Player.findById(id);
        if (!player) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        // If player has a profile pic, delete it from GridFS
        if (player.profilePic && gfs) {
            try {
                await gfs.delete(new ObjectId(player.profilePic));
            } catch (err) {
                console.warn("⚠️ Failed to delete profile image from GridFS:", err.message);
            }
        }

        // Remove player ID from the team's players array
        if (player.team) {
            await Team.findByIdAndUpdate(player.team, {
                $pull: { players: player._id },
            });
        }

        // Delete player document
        await Player.findByIdAndDelete(id);

        return NextResponse.json({ message: "Player deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Failed to delete player:", error);
        return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
    }
}
