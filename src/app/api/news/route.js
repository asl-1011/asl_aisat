"use server";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";

// 📌 GET: Fetch all news (Public Read-Only)
export async function GET() {
  try {
    await connectDB();
    const news = await News.find().sort({ createdAt: -1 });

    return NextResponse.json(news.length ? news : { message: "No news available" }, {
      status: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*", // Public API
        "Cache-Control": "public, max-age=60" // Cache for 1 minute
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 📌 Block all write operations
export async function POST() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 }); }
