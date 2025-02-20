"use server";

import { NextResponse } from "next/server";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    // ✅ Email/Password Sign-Up
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await sendEmailVerification(user);

    return NextResponse.json({
      success: true,
      message: "Signup successful. Please verify your email.",
      user: { uid: user.uid, email: user.email },
    });
  } catch (error) {
    console.error("Sign-Up error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
