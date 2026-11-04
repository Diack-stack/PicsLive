import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || process.env.NEXT_PUBLIC_DEFAULT_EVENT_CODE || "GALA-2026";
    const event = dbService.getEvent(code);
    const stats = dbService.getStats(event.id);

    return NextResponse.json({
      success: true,
      event,
      stats,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

