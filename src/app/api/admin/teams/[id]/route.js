import { NextResponse } from "next/server";
import {connectDB } from "@/lib/mongodb";
import Team from "@/models/team";

// Update a Team (PUT)
export async function PUT(req, { params }) {
    await connectDB();

    // Ensure params are awaited correctly in dynamic routes
    const { id } = await params; // This is the fix for the async/await issue

    try {
        // Parse the incoming request body
        const { players } = await req.json();

        // Check if players are provided
        if (!players || players.length === 0) {
            return NextResponse.json({ error: "No players provided" }, { status: 400 });
        }

        // Find the team by ID
        const updatedTeam = await Team.findById(id);

        if (!updatedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Check for duplicate players across all teams
        const existingPlayers = await Team.find({ _id: { $ne: id } })
            .populate("players")
            .then(teams =>
                teams.flatMap(team => team.players.map(player => player.toString())) // Assumes player ids are ObjectIds
            );

        // Filter out players already in any other team
        const newPlayers = players.filter(player => !existingPlayers.includes(player));

        // Add new players to the team (just using player IDs)
        updatedTeam.players.push(...newPlayers);

        // Save the updated team
        await updatedTeam.save();

        // Populate players after saving
        const populatedTeam = await updatedTeam.populate("players");

        return NextResponse.json(populatedTeam, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error); // Log error for debugging
        return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
    }
}
// Delete a Team (DELETE)
export async function DELETE(req, { params }) {
    await connectDB();
    const { id } = params;

    try {
        const deletedTeam = await Team.findByIdAndDelete(id);
        if (!deletedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }
}