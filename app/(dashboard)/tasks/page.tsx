import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Search, Filter, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";

export default async function AllTasksPage() {
  const session = await auth();
  const tasks = await prisma.task.findMany({
    where: { userId: session?.user?.id },
    include: {
      project: {
        select: { name: true, color: true, id: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and manage tasks across all your projects.
          </p>
        </div>
        <NewTaskDialog />
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, project, or priority..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter size={16} />
          <span>Filters</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-200">
                Task
              </th>
              <th className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-200">
                Project
              </th>
              <th className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-200">
                Priority
              </th>
              <th className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-200">
                Status
              </th>
              <th className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-200">
                Due Date
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500 italic"
                >
                  No tasks found. Get started by creating one!
                </td>
              </tr>
            ) : (
              tasks.map((task: any) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/projects/${task.project.id}/tasks/${task.id}`}
                      className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                      ></div>
                      <span className="text-slate-600 dark:text-slate-400">
                        {task.project.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === "HIGH" || task.priority === "CRITICAL"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                          : task.priority === "MEDIUM"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          task.status === "DONE"
                            ? "bg-green-500"
                            : task.status === "IN_PROGRESS"
                              ? "bg-blue-500"
                              : task.status === "WAITING"
                                ? "bg-amber-500"
                                : "bg-slate-300",
                        )}
                      ></div>
                      <span className="text-xs">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No date"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/projects/${task.project.id}/tasks/${task.id}`}
                    >
                      <ChevronRight
                        size={18}
                        className="text-slate-300 group-hover:text-indigo-500 transition-colors inline"
                      />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
