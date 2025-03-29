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
      return NextResponse.json({ authenticated: false, isAdmin: false }, { status:401 });
    }

    // ✅ Verify session cookie with Firebase Admin SDK
    try {
      console.log("[DEBUG] Verifying session cookie...");
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      console.log("[DEBUG] Decoded claims:", decodedClaims);
      const email = decodedClaims.email;
      
      // ✅ Fetch user role from Firestore using Admin SDK
      console.log("[DEBUG] Fetching user role from Firestore for email:", email);
      const usersRef = adminDb.collection("users");
      const q = usersRef.where("email", "==", email);
      const querySnapshot = await q.get();
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("[DEBUG] User data found:", userData);
        return NextResponse.json({ authenticated: true, isAdmin: userData.isAdmin || false });
      } else {
        console.log("[DEBUG] No matching user found in Firestore.");
        return NextResponse.json({ authenticated: true, isAdmin: false });
      }
    } catch (error) {
      console.error("[ERROR] Session verification failed:", error);
      return NextResponse.json({ authenticated: false, isAdmin: false }, { status: 401 });
    }
  } catch (error) {
    console.error("[ERROR] Auth check error:", error);
    return NextResponse.json({ authenticated: false, isAdmin: false }, { status: 500 });
  }
}
