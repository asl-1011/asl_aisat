import { updateAllManagersPoints } from "@/lib/updateManagersPoints";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const result = await updateAllManagersPoints();

    // Include detailed response
    return NextResponse.json({
      success: result.success,
      message: result.message,
      updatedManagers: result.updatedManagers,
      managers: result.managers || [], // Include detailed list
    });
  } catch (error) {
    console.error("❌ API Error updating manager points:", error);
    return NextResponse.json({ success: false, message: "Error executing update." }, { status: 500 });
  }
}
