import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reason, logType } = await req.json(); // logType: PAUSED or WAITING

    // Find the current active log
    const activeLog = await prisma.timeLog.findFirst({
      where: {
        taskId: id,
        endedAt: null,
        pausedAt: null,
      },
    });

    if (!activeLog) {
      return NextResponse.json(
        { error: "No active timer found" },
        { status: 400 },
      );
    }

    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - activeLog.startedAt.getTime()) / 1000,
    );

    const [updatedLog] = await prisma.$transaction([
      prisma.timeLog.update({
        where: { id: activeLog.id },
        data: {
          pausedAt: now,
          duration,
          reason,
          logType: logType || "PAUSED",
        },
      }),
      prisma.task.update({
        where: { id },
        data: { status: logType === "WAITING" ? "WAITING" : "PAUSED" },
      }),
    ]);

    return NextResponse.json(updatedLog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to pause timer" },
      { status: 500 },
    );
  }
}
