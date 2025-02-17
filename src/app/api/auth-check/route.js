import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // ✅ Await cookies()
    const cookieStore = await cookies();
    let encryptedToken = cookieStore.get("auth_token")?.value;
    let encryptedRefreshToken = cookieStore.get("refresh_token")?.value;

    if (!encryptedToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // ✅ Validate Token with Supabase
    const { data: user, error } = await supabase.auth.getUser(encryptedToken);

    if (error) {
      console.error("Supabase Auth Error:", error.message);
      return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ authenticated: !!user }, { status: 200 });

  } catch (err) {
    console.error("Auth Check Error:", err.message);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
