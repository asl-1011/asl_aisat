"use server";

import { NextResponse } from "next/server";

export async function GET() {
  const newsData = [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1600250395178-40fe752e5189?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      title: "Championship Finals Approaching",
      description: "Get ready for the most anticipated match of the season",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      title: "New Training Facility Opening",
      description: "State-of-the-art facility to enhance player development",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      title: "Youth Academy Success",
      description: "Local talents showing promising results",
    },
  ];

  return NextResponse.json(newsData);
}
