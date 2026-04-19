import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(projectId && { projectId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: { name: true, color: true },
        },
        _count: {
          select: { timeLogs: true },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("/api/tasks GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: (error as Error)?.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, projectId, priority, dueDate } =
      await req.json();

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and Project ID are required" },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("/api/tasks POST error:", error);
    return NextResponse.json(
      { error: "Failed to create task", details: (error as Error)?.message },
      { status: 500 },
    );
  }
}
