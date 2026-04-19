"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Trash2, Edit2, Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface DeadlineListItem {
  id: string;
  title: string;
  dueDate: Date;
  projectId: string;
  notifyAt: Date | null;
  project: { name: string; color: string };
}

interface DeadlineListProps {
  deadlines: DeadlineListItem[];
}

export default function DeadlineList({ deadlines }: DeadlineListProps) {
  const router = useRouter();
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [deletingDeadlineId, setDeletingDeadlineId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingDeadlineId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/deadlines/${deletingDeadlineId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete deadline");
      }
      toast.success("Deadline deleted");
      setDeletingDeadlineId(null);
      setOpenMenuFor(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete deadline");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {deadlines.length === 0 ? (
        <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
          <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p>No deadlines set for your projects.</p>
        </div>
      ) : (
        deadlines.map((deadline) => {
          const isOverdue = new Date(deadline.dueDate) < new Date();
          return (
            <div
              key={deadline.id}
              className={`p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm flex items-center justify-between ${isOverdue ? "border-red-200 dark:border-red-900/50" : "border-slate-200 dark:border-slate-800"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : "bg-indigo-50 dark:bg-indigo-900/20"}`}
                >
                  {isOverdue ? (
                    <AlertTriangle className="text-red-500" size={24} />
                  ) : (
                    <CalendarIcon className="text-indigo-600 dark:text-indigo-400" size={24} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {deadline.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.2em] ${isOverdue ? "text-red-500" : "text-indigo-600 dark:text-indigo-400"}`}
                    >
                      {isOverdue ? "Overdue" : "Deadline"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: deadline.project.color }}
                    />
                    <span>{deadline.project.name}</span>
                    <span>•</span>
                    <span className={isOverdue ? "text-red-500 font-semibold" : ""}>
                      {new Date(deadline.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {deadline.notifyAt && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold">
                    <Clock size={12} />
                    <span>Reminder Set</span>
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuFor((current) =>
                        current === deadline.id ? null : deadline.id,
                      );
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-md transition"
                    aria-label="Deadline actions"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuFor === deadline.id && (
                    <div
                      className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Link
                        href={`/deadlines/${deadline.id}`}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setOpenMenuFor(null)}
                      >
                        <Edit2 size={14} />
                        Edit Deadline
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingDeadlineId(deadline.id);
                          setOpenMenuFor(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 size={14} />
                        Delete Deadline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingDeadlineId)}
        onOpenChange={(open) => {
          if (!open) setDeletingDeadlineId(null);
        }}
        title="Delete Deadline"
        description="Are you sure you want to delete this deadline? This cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
