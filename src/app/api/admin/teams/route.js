import { connectDB } from "@/lib/mongodb";
import Team from "@/models/team";
import { NextResponse } from "next/server";


export async function GET() {
    await connectDB();
    try {
        const teams = await Team.find().populate("players");
        return NextResponse.json(teams, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const { team_name, team_logo, manager, players } = await req.json();
        const newTeam = await Team.create({ team_name, team_logo, manager, players });
        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}
