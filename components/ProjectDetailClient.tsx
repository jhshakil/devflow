"use client";

import TaskBoard from "@/components/tasks/TaskBoard";
import { Settings, Search, Filter, ChevronRight } from "lucide-react";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/lib/types";

interface ProjectDetailClientProps {
  project: Project;
  initialTasks: Task[];
}

export default function ProjectDetailClient({ project, initialTasks }: ProjectDetailClientProps) {
  const [view, setView] = useState<"board" | "list" | "timeline">("board");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {project.description || "Project Workspace"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors">
            <Settings size={18} className="text-slate-500" />
          </button>
          <NewTaskDialog projectId={project.id} onTaskCreated={handleTaskCreated} />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView("board")}
            className={cn(
              "text-sm font-medium pb-4 -mb-4 transition-colors",
              view === "board" ? "border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "text-sm font-medium pb-4 -mb-4 transition-colors",
              view === "list" ? "border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            List
          </button>
          <button
            onClick={() => setView("timeline")}
            className={cn(
              "text-sm font-medium pb-4 -mb-4 transition-colors",
              view === "timeline" ? "border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Timeline
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-indigo-500 outline-none w-48"
            />
          </div>
          <button className="flex items-center gap-1.5 p-2 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "board" && <TaskBoard project={project} initialTasks={initialTasks} tasks={tasks} />}
        {view === "list" && <TaskList tasks={tasks} projectId={project.id} />}
        {view === "timeline" && <TaskTimeline tasks={tasks} />}
      </div>
    </div>
  );
}

function TaskList({ tasks, projectId }: { tasks: Task[]; projectId: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-200">
              Task
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
                colSpan={5}
                className="px-6 py-12 text-center text-slate-500 italic"
              >
                No tasks found. Create one to get started!
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/projects/${projectId}/tasks/${task.id}`}
                    className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {task.title}
                  </Link>
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
                    href={`/projects/${projectId}/tasks/${task.id}`}
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
  );
}

function TaskTimeline({ tasks }: { tasks: Task[] }) {
  const sortedTasks = tasks.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 opacity-40">
          <div className="text-4xl">📅</div>
          <p className="text-sm mt-2">No tasks with due dates.</p>
        </div>
      ) : (
        sortedTasks.map((task, idx) => (
          <div key={task.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              {idx + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-slate-500">{task.description}</p>
              <p className="text-xs text-slate-400 mt-1">
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
              </p>
            </div>
            <Link
              href={`/projects/${task.projectId}/tasks/${task.id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              View
            </Link>
          </div>
        ))
      )}
    </div>
  );
}