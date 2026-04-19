"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Folder, Loader2 } from "lucide-react";
import type { Project } from "@/lib/types";

interface EditProjectFormProps {
  project: Project;
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    color: project.color,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update project");
      }

      toast.success("Project updated");
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to save changes");
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { name: "Indigo", value: "#7F77DD" },
    { name: "Sky", value: "#0EA5E9" },
    { name: "Emerald", value: "#10B981" },
    { name: "Amber", value: "#F59E0B" },
    { name: "Rose", value: "#F43F5E" },
    { name: "Slate", value: "#64748B" },
    { name: "Violet", value: "#8B5CF6" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Folder size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edit Project
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Update the project name, description, or color.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Project Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Project name"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the project"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Workspace Color
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  formData.color === color.value
                    ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {formData.color === color.value && (
                  <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
