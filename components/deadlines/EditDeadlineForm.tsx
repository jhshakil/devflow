"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

type ProjectItem = {
  id: string;
  name: string;
  color: string;
};

interface EditableDeadline {
  id: string;
  title: string;
  dueDate: Date;
  projectId: string;
  notifyAt: Date | null;
  project: { id: string; name: string; color: string };
}

interface EditDeadlineFormProps {
  deadline: EditableDeadline;
}

export default function EditDeadlineForm({ deadline }: EditDeadlineFormProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: deadline.title,
    dueDate: deadline.dueDate.toISOString().slice(0, 10),
    projectId: deadline.projectId,
    notifyAt: deadline.notifyAt ? deadline.notifyAt.toISOString().slice(0, 16) : "",
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data || []);
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadProjects();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/deadlines/${deadline.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          dueDate: form.dueDate,
          projectId: form.projectId,
          notifyAt: form.notifyAt || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update deadline");
      }

      toast.success("Deadline updated");
      router.push("/deadlines");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not save deadline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Calendar size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edit Deadline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Change the title, due date, or project for this deadline.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="text-sm font-medium">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            required
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
          <label className="text-sm font-medium">Reminder (optional)</label>
          <input
            type="datetime-local"
            value={form.notifyAt}
            onChange={(e) => setForm({ ...form, notifyAt: e.target.value })}
            className="w-full mt-1 rounded-md border px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Deadline"}
        </button>
      </form>
    </div>
  );
}
