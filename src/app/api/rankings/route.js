"use server";

import { NextResponse } from "next/server";

export async function GET() {
  const rankings = [
    {
      team_id: "team1",
      team_name: "Kerala Blasters",
      team_logo:
        "https://ssl.gstatic.com/onebox/media/sports/logos/_5VS8XluJxBhUh29V2yB_Q_96x96.png",
      matches_played: 10,
      wins: 7,
      draws: 2,
      losses: 1,
      points: 23,
    },
    {
      team_id: "team2",
      team_name: "Jamshedpur FC",
      team_logo:
        "https://ssl.gstatic.com/onebox/media/sports/logos/2jNyU8xC7U5Kg5oA_EOpSA_96x96.png",
      matches_played: 10,
      wins: 6,
      draws: 3,
      losses: 1,
      points: 21,
    },
    {
      team_id: "team3",
      team_name: "Mumbai City FC",
      team_logo:
        "https://ssl.gstatic.com/onebox/media/sports/logos/pFOymUjummnYYqKp__o-LQ_96x96.png",
      matches_played: 10,
      wins: 5,
      draws: 2,
      losses: 3,
      points: 17,
    },
  ];

  return NextResponse.json(rankings);
}

export async function POST() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
