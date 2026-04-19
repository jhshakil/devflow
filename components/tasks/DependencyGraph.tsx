"use client";

import { GitMerge, GitPullRequest, GitBranch, ArrowRight } from "lucide-react";

import type { Task } from "@/lib/types";

interface DependencyGraphProps {
  dependencies: Task[];
  taskTitle: string;
}

export default function DependencyGraph({
  dependencies,
  taskTitle,
}: DependencyGraphProps) {
  if (!dependencies || dependencies.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30">
        <GitMerge className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-500 italic">
          No dependencies found for this task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={18} className="text-indigo-500" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
          Prerequisites
        </h3>
      </div>

      <div className="space-y-3">
        {dependencies.map((dep) => (
          <div
            key={dep.id}
            className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group hover:border-indigo-500/30 transition-all cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 transition-colors">
              <GitPullRequest size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{dep.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    dep.status === "DONE"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {dep.status}
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  Blocked until complete
                </span>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-200 group-hover:text-slate-400"
            />
          </div>
        ))}

        <div className="flex items-center justify-center p-3">
          <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-4 ring-2 ring-indigo-500/20">
          <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <GitMerge size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
              {taskTitle}
            </p>
            <p className="text-[10px] uppercase font-bold text-indigo-500">
              Current Task
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
