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
    // Check for existing active logs for this user across all tasks
    const activeLog = await prisma.timeLog.findFirst({
      where: {
        task: { userId: session.user.id },
        endedAt: null,
        pausedAt: null,
      },
    });

    if (activeLog) {
      return NextResponse.json(
        {
          error: "Another task is already running. Please stop it first.",
          activeTaskId: activeLog.taskId,
        },
        { status: 400 },
      );
    }

    // Create new log and update task status
    const [log] = await prisma.$transaction([
      prisma.timeLog.create({
        data: {
          taskId: id,
          logType: "ACTIVE",
          startedAt: new Date(),
        },
      }),
      prisma.task.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      }),
    ]);

    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start timer" },
      { status: 500 },
    );
  }
}
