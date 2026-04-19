import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  interface DashboardProject {
    id: string;
    name: string;
    description: string | null;
    color: string;
    _count: {
      tasks: number;
    };
    tasks: {
      status: string;
    }[];
  }

  // Fetch projects with task counts for progress calculation
  const projects = (await prisma.project.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
      tasks: {
        select: {
          status: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  })) as DashboardProject[];

  // Fetch some stats
  const [taskCount, completedTaskCount, pendingDeadlines] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "DONE" } }),
    prisma.deadline.count({
      where: {
        project: { userId },
        dueDate: { gt: new Date() },
      },
    }),
  ]);

  const stats = [
    {
      name: "Total Tasks",
      value: taskCount,
      icon: CheckSquare,
      color: "text-blue-500",
    },
    {
      name: "Completed",
      value: completedTaskCount,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      name: "Upcoming Deadlines",
      value: pendingDeadlines,
      icon: Clock,
      color: "text-purple-500",
    },
    {
      name: "Active Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Welcome back, {session.user.name}. Here&apos;s what&apos;s
                  happening today.
                </p>
              </div>
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Plus size={18} />
                New Project
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.name}
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${item.color}`}
                    >
                      <item.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {item.name}
                      </p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projects List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Your Projects</h2>
                  <Link
                    href="/projects"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.length > 0 ? (
                    projects.map((project: DashboardProject) => {
                      const totalTasks = project._count.tasks;
                      const completedTasks = project.tasks.filter(
                        (t: { status: string }) => t.status === "DONE",
                      ).length;
                      const progress =
                        totalTasks > 0
                          ? Math.round((completedTasks / totalTasks) * 100)
                          : 0;

                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: project.color }}
                            >
                              {project.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {totalTasks} Tasks
                            </span>
                          </div>
                          <h3 className="font-bold group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
                            {project.description || "No description provided."}
                          </p>
                          <ProgressBar
                            progress={progress}
                            showLabels
                            size="sm"
                          />
                        </Link>
                      );
                    })
                  ) : (
                    <div className="col-span-2 py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                        <FolderKanban size={32} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        No projects found. Create one to get started!
                      </p>
                      <Link
                        href="/projects/new"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Create your first project
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info Panel */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Activity</h2>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          Updated Prisma config
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Just now
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          Dashboard redesigned
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
