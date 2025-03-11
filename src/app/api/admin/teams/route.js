import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Team from "@/models/team";

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find({}, "team_name team_logo");
    
    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
