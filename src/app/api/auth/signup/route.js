"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encrypt } from "@/utils/aes";  // Import encryption utility

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// Initialize Supabase client securely
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/**
 * Handles user sign up request.
 * @param {Request} req - The incoming request object
 * @returns {NextResponse} - JSON response
 */
export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Attempt sign-up
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Send confirmation email (handled automatically by Supabase)
    if (user) {
      return NextResponse.json({
        success: true,
        message: "Sign-up successful. Please check your email for confirmation.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
