import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TaskTimer from "@/components/tasks/TaskTimer";
import TaskTimeline from "@/components/tasks/TaskTimeline";
import DependencyGraph from "@/components/tasks/DependencyGraph";
import { calculateTaskTimeSummary } from "@/lib/time";
import { ChevronLeft, Calendar, Flag, Layout, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TaskDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await paramsPromise;
  const session = await auth();
  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: session?.user?.id },
    include: {
      project: true,
      timeLogs: {
        orderBy: { startedAt: "desc" },
      },
      dependencies: true,
    },
  });

  if (!task) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href={`/projects/${id}`}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            <Link href="/projects" className="hover:text-indigo-600">
              Projects
            </Link>
            <ChevronLeft size={10} className="rotate-180" />
            <Link href={`/projects/${id}`} className="hover:text-indigo-600">
              {task.project.name}
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Content Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="text-slate-400 italic">
                  No description provided for this task.
                </p>
              )}
            </div>
          </div>

          {/* Time Tracking History */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Session History</h2>
              <span className="text-xs text-slate-500">
                {task.timeLogs.length} logs found
              </span>
            </div>
            <TaskTimeline timeLogs={task.timeLogs} />
          </div>

          {/* Dependencies Graph */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <DependencyGraph
              dependencies={task.dependencies}
              taskTitle={task.title}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Timer Card */}
          <TaskTimer task={task} initialTimeLogs={task.timeLogs} />

          {/* Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-2">
              Meta Details
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Flag size={16} />
                <span>Priority</span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  task.priority === "HIGH" || task.priority === "CRITICAL"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                    : task.priority === "MEDIUM"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                }`}
              >
                {task.priority}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Layout size={16} />
                <span>Status</span>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {task.status.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={16} />
                <span>Due Date</span>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Overall Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
