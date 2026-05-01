import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q) return NextResponse.json({ projects: [], tasks: [], teams: [] });

  try {
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          { OR: [{ userId }, { team: { members: { some: { userId } } } }] },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, color: true },
    });

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId },
              { project: { team: { members: { some: { userId } } } } },
            ],
          },
          {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: 5,
      select: { id: true, title: true, status: true, projectId: true },
    });

    const teams = await prisma.team.findMany({
      where: {
        AND: [
          { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: { id: true, name: true },
    });

    return NextResponse.json({ projects, tasks, teams });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
