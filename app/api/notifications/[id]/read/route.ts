import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const notification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: { read: true },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATION_READ]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
