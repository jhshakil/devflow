"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Trash2, Edit2, Folder } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Project } from "@/lib/types";

interface ProjectsListProps {
  projects: Array<Project & { _count: { tasks: number } }>;
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const router = useRouter();
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingProjectId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deletingProjectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Unable to delete project");
      }
      toast.success("Project deleted");
      setDeletingProjectId(null);
      setOpenMenuFor(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-900">
            <Folder className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No projects</h3>
          <p className="mt-1 text-sm text-slate-500">
            Create your first project to start organizing work.
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-white border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: project.color }}
                >
                  {project.name.charAt(0)}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuFor((current) =>
                        current === project.id ? null : project.id,
                      );
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-md transition"
                    aria-label="Project actions"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuFor === project.id && (
                    <div
                      className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setOpenMenuFor(null)}
                      >
                        <Edit2 size={14} />
                        Edit Project
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingProjectId(project.id);
                          setOpenMenuFor(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 size={14} />
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/projects/${project.id}`)}
                className="mt-4 text-left"
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {project.description || "No description provided."}
                </p>
              </button>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {project._count.tasks} Tasks
                </span>
                <span className="text-xs text-slate-400">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingProjectId)}
        onOpenChange={(open) => {
          if (!open) setDeletingProjectId(null);
        }}
        title="Delete Project"
        description="Are you sure you want to delete this project? This cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
