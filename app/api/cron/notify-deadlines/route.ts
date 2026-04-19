import { NextResponse } from "next/server";
import { checkAndNotifyDeadlines } from "@/lib/notifications";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");

  // Protect with secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkAndNotifyDeadlines();
    return NextResponse.json({
      success: true,
      notifiedCount: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Notification process failed" },
      { status: 500 },
    );
  }
}
