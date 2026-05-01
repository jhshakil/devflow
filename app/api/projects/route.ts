import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { team: { members: { some: { userId: session.user.id } } } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        team: { select: { id: true, name: true } },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("/api/projects GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", details: (error as Error)?.message },
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
    const { name, description, color, teamId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || "#7F77DD",
        userId: session.user.id,
        ...(teamId ? { teamId } : {}),
      },
      include: { team: { select: { id: true, name: true } } },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("/api/projects POST error:", error);
    return NextResponse.json(
      { error: "Failed to create project", details: (error as Error)?.message },
      { status: 500 },
    );
  }
}
