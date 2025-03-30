import { NextResponse } from "next/server";
import {connectDB } from "@/lib/mongodb";
import Team from "@/models/team";

// Update a Team (PUT)
export async function PUT(req, { params }) {
    await connectDB();
    const { id } = params;

    try {
        const { team_name, team_logo, manager, players } = await req.json();
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { team_name, team_logo, manager, players },
            { new: true }
        ).populate("players");

        if (!updatedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTeam, { status: 200 });
    } catch (error) {
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