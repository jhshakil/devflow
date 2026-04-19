"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Project, Task, Priority } from "@/lib/types";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: (task: Task) => void;
}

function normalizeDateValue(value: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function EditTaskDialog({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    projectId: task.projectId,
    priority: task.priority,
    dueDate: normalizeDateValue(task.dueDate),
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          projectId: form.projectId,
          priority: form.priority,
          dueDate: form.dueDate ? new Date(form.dueDate) : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await res.json();
      toast.success("Task updated");
      onOpenChange(false);
      onTaskUpdated?.(updatedTask);
      router.push(`/projects/${task.projectId}`);
    } catch (error) {
      console.error(error);
      toast.error("Could not update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update the task details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Project</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

