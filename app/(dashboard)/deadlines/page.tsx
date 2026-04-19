import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewDeadlineDialog from "@/components/deadlines/NewDeadlineDialog";
import DeadlineList from "@/components/deadlines/DeadlineList";

export default async function DeadlinesPage() {
  const session = await auth();
  const deadlines = await prisma.deadline.findMany({
    where: { project: { userId: session?.user?.id } },
    include: {
      project: { select: { name: true, color: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track critical project dates and reminders.
          </p>
        </div>
        <NewDeadlineDialog />
      </div>

      <DeadlineList deadlines={deadlines} />
    </div>
  );
}
