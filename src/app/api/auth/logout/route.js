"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // ✅ Clear authentication cookies
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "", { expires: new Date(0) });
    cookieStore.set("refresh_token", "", { expires: new Date(0) });

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
