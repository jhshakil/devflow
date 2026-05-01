import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { email, role } = await req.json();

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const currentMember = team.members.find((m) => m.userId === userId);
    if (
      team.ownerId !== userId &&
      currentMember?.role !== "ADMIN" &&
      currentMember?.role !== "OWNER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 },
      );
    }

    const alreadyMember = team.members.find((m) => m.userId === userToAdd.id);
    if (alreadyMember) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 },
      );
    }

    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: userToAdd.id,
        role: role || "MEMBER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("POST /api/teams/[teamId]/members error:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 },
    );
  }
}
