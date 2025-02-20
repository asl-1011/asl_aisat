"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin"; // Firebase Admin SDK

export async function POST() {
  try {
    // ✅ Get session cookie from request
    const sessionCookie = cookies().get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // ✅ Verify session cookie with Firebase Admin SDK
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      return NextResponse.json({ authenticated: true, user: decodedClaims });
    } catch (error) {
      console.error("Session verification failed:", error);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
