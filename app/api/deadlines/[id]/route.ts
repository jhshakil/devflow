import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deadline = await prisma.deadline.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, color: true, userId: true } } },
    });
    if (!deadline || deadline.project?.userId !== session.user.id) {
      return NextResponse.json({ error: "Deadline not found" }, { status: 404 });
    }
    return NextResponse.json(deadline);
  } catch (error) {
    console.error("/api/deadlines/[id] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deadline" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, dueDate, projectId, notifyAt } = await req.json();
    const deadline = await prisma.deadline.updateMany({
      where: {
        id,
        project: { userId: session.user.id },
      },
      data: {
        title,
        dueDate: new Date(dueDate),
        projectId,
        notifyAt: notifyAt ? new Date(notifyAt) : null,
      },
    });

    if (deadline.count === 0) {
      return NextResponse.json({ error: "Deadline not found" }, { status: 404 });
    }

    const updatedDeadline = await prisma.deadline.findUnique({ where: { id } });
    return NextResponse.json(updatedDeadline);
  } catch (error) {
    console.error("/api/deadlines/[id] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update deadline" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await prisma.deadline.deleteMany({
      where: {
        id,
        project: { userId: session.user.id },
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Deadline not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deadline deleted" });
  } catch (error) {
    console.error("/api/deadlines/[id] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete deadline" },
      { status: 500 },
    );
  }
}
