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
    // Resume simply creates a new ACTIVE log
    // We reuse the start logic essentially, but specifically for a task that was paused/waiting

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
          error: "Another task is already running.",
          activeTaskId: activeLog.taskId,
        },
        { status: 400 },
      );
    }

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
      { error: "Failed to resume timer" },
      { status: 500 },
    );
  }
}
