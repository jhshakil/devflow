import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const teamId = (await params).teamId ;

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        projects: true,
      },
    });

    if (!team)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const isMember =
      team.ownerId === userId || team.members.some((m) => m.userId === userId);
    if (!isMember)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(team);
  } catch (error) {
    console.error("GET /api/teams/[teamId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const teamId = (await params).teamId ;

  try {
    const { name, description } = await req.json();

    const teamStats = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!teamStats)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const member = teamStats.members.find((m) => m.userId === userId);
    if (
      teamStats.ownerId !== userId &&
      member?.role !== "ADMIN" &&
      member?.role !== "OWNER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name, description },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("PATCH /api/teams/[teamId] error:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const teamId = (await params).teamId ;

  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - Only owners can delete team" },
        { status: 403 },
      );
    }

    await prisma.team.delete({ where: { id: teamId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teams/[teamId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}
