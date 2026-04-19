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
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";

interface NewDeadlineDialogProps {
  projectId?: string;
}

export default function NewDeadlineDialog({ projectId }: NewDeadlineDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ title: "", dueDate: "", projectId: projectId || "", notifyAt: "" });

  useEffect(() => {
    if (projectId) return;
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

  useEffect(() => {
    if (projectId) setForm((s) => ({ ...s, projectId }));
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate || !form.projectId) {
      toast.error("Title, due date and project required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          dueDate: form.dueDate,
          projectId: form.projectId,
          notifyAt: form.notifyAt || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create deadline");
      }

      toast.success("Deadline created");
      setOpen(false);
      setForm({ title: "", dueDate: "", projectId: projectId || "", notifyAt: "" });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Failed to create deadline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors">
          <Calendar size={18} />
          <span>New Deadline</span>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Deadline</DialogTitle>
          <DialogDescription>Set a deadline for a project and optional reminder.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 rounded-md border px-3 py-2" required />
          </div>

          <div>
            <label className="text-sm font-medium">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full mt-1 rounded-md border px-3 py-2" required />
          </div>

          {!projectId && (
            <div>
              <label className="text-sm font-medium">Project</label>
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full mt-1 rounded-md border px-3 py-2" required>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Reminder (optional)</label>
            <input type="datetime-local" value={form.notifyAt} onChange={(e) => setForm({ ...form, notifyAt: e.target.value })} className="w-full mt-1 rounded-md border px-3 py-2" />
          </div>

          <DialogFooter>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50">
              {loading ? "Creating..." : "Create Deadline"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
