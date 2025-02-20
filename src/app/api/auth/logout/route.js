"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin"; // Import Firebase Admin SDK instance

export async function POST(req) {
  try {
    // ✅ Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 400 });
    }

    // ✅ Verify the session token and revoke it
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    await admin.auth().revokeRefreshTokens(decodedToken.uid);

    // ✅ Clear authentication cookie
    cookieStore.set("session", "", { expires: new Date(0) });

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
