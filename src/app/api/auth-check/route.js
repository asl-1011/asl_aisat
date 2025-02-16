"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/utils/aes"; // Import AES decryption function

// ✅ Initialize Supabase securely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
  try {
    // ✅ Get cookies
    const cookieStore = cookies();
    let encryptedToken = cookieStore.get("auth_token")?.value;
    let encryptedRefreshToken = cookieStore.get("refresh_token")?.value;

    if (!encryptedToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // ✅ Decrypt tokens before use
    const token = decrypt(encryptedToken);
    const refreshToken = encryptedRefreshToken ? decrypt(encryptedRefreshToken) : null;

    // ✅ Validate Token with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error) {
      // ✅ If token is expired, try refreshing with decrypted refresh token
      if (refreshToken) {
        const { data, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (refreshError) {
          return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // ✅ Encrypt and update new tokens in cookies
        const newAccessToken = data.session.access_token;
        const newRefreshToken = data.session.refresh_token;

        cookieStore.set("auth_token", encrypt(newAccessToken), { httpOnly: true, secure: true });
        cookieStore.set("refresh_token", encrypt(newRefreshToken), { httpOnly: true, secure: true });

        return NextResponse.json({ authenticated: true });
      } else {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
