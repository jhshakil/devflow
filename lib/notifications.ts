import { prisma } from "./prisma";

export async function checkAndNotifyDeadlines() {
  const now = new Date();

  try {
    const pendingDeadlines = await prisma.deadline.findMany({
      where: {
        notifyAt: { lte: now },
        notified: false,
      },
      include: {
        project: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (pendingDeadlines.length === 0) return { count: 0 };

    for (const deadline of pendingDeadlines) {
      console.log(
        `NOTIFY: Deadline "${deadline.title}" for user ${deadline.project.user.email}`,
      );

      // In a real app, send email here (Resend, Nodemailer, etc.)

      await prisma.deadline.update({
        where: { id: deadline.id },
        data: { notified: true },
      });
    }

    return { count: pendingDeadlines.length };
  } catch (error) {
    console.error("Deadline notification error:", error);
    throw error;
  }
}
