/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
import NewDeadlineDialog from "@/components/deadlines/NewDeadlineDialog";

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {deadlines.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>No deadlines set for your projects.</p>
          </div>
        ) : (
          deadlines.map((deadline: any) => {
            const isOverdue = new Date(deadline.dueDate) < new Date();
            return (
              <div
                key={deadline.id}
                className={`p-6 bg-white dark:bg-slate-900 border ${isOverdue ? "border-red-200 dark:border-red-900/50" : "border-slate-200 dark:border-slate-800"} rounded-xl shadow-sm flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : "bg-indigo-50 dark:bg-indigo-900/20"}`}
                  >
                    {isOverdue ? (
                      <AlertTriangle className="text-red-500" size={24} />
                    ) : (
                      <CalendarIcon
                        className="text-indigo-600 dark:text-indigo-400"
                        size={24}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{deadline.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: deadline.project.color }}
                      ></div>
                      <span>{deadline.project.name}</span>
                      <span>•</span>
                      <span
                        className={
                          isOverdue ? "text-red-500 font-semibold" : ""
                        }
                      >
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {deadline.notifyAt && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 justify-end uppercase font-bold">
                      <Clock size={12} />
                      <span>Reminder Set</span>
                    </div>
                  )}
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                    Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
