"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Project, Task } from "@/lib/types";

interface NewTaskDialogProps {
  projectId?: string;
  onTaskCreated?: (task: Task) => void;
}

export default function NewTaskDialog({ projectId, onTaskCreated }: NewTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: projectId || "",
    priority: "MEDIUM",
    dueDate: "",
  });

  useEffect(() => {
    if (projectId) return; // no need to fetch projects when project provided
    async function load() {
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
    load();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.projectId) {
      toast.error("Title and project required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          projectId: form.projectId,
          priority: form.priority,
          dueDate: form.dueDate || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create task");
      }

      const task = await res.json();
      toast.success("Task created");
      onTaskCreated?.(task);
      router.refresh();
      setTimeout(() => setOpen(false), 500); // Allow time for refresh
      setForm({ title: "", description: "", projectId: projectId || "", priority: "MEDIUM", dueDate: "" });
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors">
          <Plus size={18} />
          <span>{projectId ? "Add Task" : "New Task"}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Quickly add a task to a project.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 rounded-md border px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              rows={3}
            />
          </div>

          {!projectId && (
            <div>
              <label className="text-sm font-medium">Project</label>
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full mt-1 rounded-md border px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                required
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full mt-1 rounded-md border px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
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
                className="w-full mt-1 rounded-md border px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <DialogFooter>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50">
              {loading ? "Creating..." : "Create Task"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
