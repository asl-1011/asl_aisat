"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { adminAuth } from "@/lib/firebaseAdmin"; // Firebase Admin SDK
import { app } from "@/lib/firebase"; // Firebase Client SDK

const auth = getAuth(app);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // ✅ Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Check if the email is verified
    if (!user.emailVerified) {
      await sendEmailVerification(user);
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // ✅ Create session cookie (valid for 2 weeks)
    const idToken = await user.getIdToken();
    const expiresIn = 14 * 24 * 60 * 60 * 1000; // 2 weeks
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // ✅ Store session token in HTTP-only cookies
    cookies().set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: expiresIn / 1000, // Convert ms to seconds
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
