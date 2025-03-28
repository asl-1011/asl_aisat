import { updateAllPlayersData } from "@/lib/updatePlayer"; // Adjust path if needed
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await updateAllPlayersData();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
