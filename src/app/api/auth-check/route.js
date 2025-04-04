"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin"; // Firebase Admin SDK
import { getFirestore } from "firebase-admin/firestore"; // Firestore Admin SDK

const adminDb = getFirestore(); // Use Firestore Admin SDK

export async function POST() {
  try {
    console.log("[DEBUG] Checking session cookie...");
    // ✅ Get session cookie from request
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      console.log("[DEBUG] No session cookie found.");
      return NextResponse.json({ authenticated: false, isAdmin: false }, { status: 401 });
    }

    console.log("[DEBUG] Verifying session cookie...");
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log("[DEBUG] Decoded claims:", decodedClaims);
    const email = decodedClaims.email;

    // ✅ Fetch user role from Firestore using Admin SDK
    console.log("[DEBUG] Fetching user role from Firestore for email:", email);
    const userDoc = await adminDb.collection("users").where("email", "==", email).limit(1).get();

    const isAdmin = !userDoc.empty && userDoc.docs[0].data().isAdmin === true;

    console.log(`[DEBUG] User authentication success. isAdmin: ${isAdmin}`);

    return NextResponse.json({ authenticated: true, isAdmin });

  } catch (error) {
    console.error("[ERROR] Authentication process failed:", error);
    return NextResponse.json({ authenticated: false, isAdmin: false }, { status: 500 });
  }
}
