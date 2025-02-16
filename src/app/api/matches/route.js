"use server";

import { NextResponse } from "next/server";

export async function GET() {
  const matchData = [
    {
      id: 1,
      team1: "Warriors FC",
      team2: "Phoenix United",
      team1Logo:
        "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      team2Logo:
        "https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      score: "2 - 1",
      status: "recent",
      description: "Today 15:00",
    },
    {
      id: 2,
      team1: "Royal Eagles",
      team2: "Storm City",
      team1Logo:
        "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      team2Logo:
        "https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      score: "0 - 0",
      status: "upcoming",
      description: "Today 18:00",
    },
    {
      id: 3,
      team1: "Titans SC",
      team2: "Victory FC",
      team1Logo:
        "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      team2Logo:
        "https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      score: "",
      status: "live",
      description: "Live now",
    },
  ];

  return NextResponse.json(matchData);
}

export async function POST() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
