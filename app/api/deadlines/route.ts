import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deadlines = await prisma.deadline.findMany({
      where: { project: { userId: session.user.id } },
      include: {
        project: { select: { name: true, color: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(deadlines);
  } catch (error) {
    console.error("/api/deadlines GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deadlines", details: (error as Error)?.message },
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
    const { title, dueDate, projectId, notifyAt } = await req.json();

    if (!title || !dueDate || !projectId) {
      return NextResponse.json(
        { error: "Title, due date, and project are required" },
        { status: 400 },
      );
    }

    const deadline = await prisma.deadline.create({
      data: {
        title,
        dueDate: new Date(dueDate),
        projectId,
        notifyAt: notifyAt ? new Date(notifyAt) : null,
      },
    });

    return NextResponse.json(deadline);
  } catch (error) {
    console.error("/api/deadlines POST error:", error);
    return NextResponse.json(
      { error: "Failed to create deadline", details: (error as Error)?.message },
      { status: 500 },
    );
  }
}
