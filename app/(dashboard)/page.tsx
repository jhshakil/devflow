import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeadlinePanel from "@/components/deadlines/DeadlinePanel";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  // Fetch real deadlines for the panel
  const latestDeadlines = await prisma.deadline.findMany({
    where: { project: { userId: session?.user?.id } },
    orderBy: { dueDate: "asc" },
    take: 1,
  });

  // Mock stats for UI development
  const stats = [
    {
      name: "Total Tasks",
      value: "24",
      icon: ListTodo,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Tasks Done",
      value: "18",
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      name: "Active Time",
      value: "5h 24m",
      icon: Clock,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      name: "Overdue",
      value: "2",
      icon: TrendingUp,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "Developer"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {`Here's what's happening in your workspace today.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {stat.name}
                </p>
                <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{`Today's Tasks`}</h2>
            <Link
              href="/tasks"
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                {
                  title: "Fix auth token refresh bug",
                  project: "DevFlow",
                  priority: "HIGH",
                },
                {
                  title: "Implement Kanban drag-n-drop",
                  project: "DevFlow",
                  priority: "MEDIUM",
                },
                {
                  title: "Review PR #42",
                  project: "API Gateway",
                  priority: "LOW",
                },
              ].map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-5 rounded border border-slate-300 dark:border-slate-600"></div>
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === "HIGH"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                          : task.priority === "MEDIUM"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <Link
              href="/deadlines"
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          <DeadlinePanel deadlines={latestDeadlines} />

          <div className="space-y-3 pt-2">
            {[
              { title: "Design Review", date: "April 20", countdown: "3d 8h" },
            ].map((deadline, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <Clock
                      size={20}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{deadline.title}</p>
                    <p className="text-xs text-slate-500">{deadline.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {deadline.countdown}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase">
                    remaining
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
