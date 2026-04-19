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
    // Find the current active log for this task
    const activeLog = await prisma.timeLog.findFirst({
      where: {
        taskId: id,
        endedAt: null,
        pausedAt: null,
      },
    });

    const now = new Date();

    if (activeLog) {
      // Calculate duration for the last segment
      const duration = Math.floor(
        (now.getTime() - activeLog.startedAt.getTime()) / 1000,
      );

      await prisma.timeLog.update({
        where: { id: activeLog.id },
        data: {
          endedAt: now,
          duration,
        },
      });
    }

    // Mark all logs for this task as ended if any were forgotten (insurance)
    await prisma.timeLog.updateMany({
      where: {
        taskId: id,
        endedAt: null,
        pausedAt: null,
      },
      data: {
        endedAt: now,
      },
    });

    // Sum all ACTIVE durations for this task
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        taskId: id,
        logType: "ACTIVE",
        duration: { not: null },
      },
    });

    const totalTime = timeLogs.reduce(
      (sum: number, log: any) => sum + (log.duration || 0),
      0,
    );

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "DONE",
        progress: 100,
        totalTime,
        completedAt: now,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to stop timer" },
      { status: 500 },
    );
  }
}
