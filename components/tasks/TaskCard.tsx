"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Calendar, Clock, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import EditTaskDialog from "./EditTaskDialog";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export default function TaskCard({ task, projectId }: TaskCardProps) {
  const router = useRouter();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const priorityMap: Record<string, "error" | "warning" | "info" | "default"> =
    {
      CRITICAL: "error",
      HIGH: "error",
      MEDIUM: "warning",
      LOW: "info",
    };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
      toast.success("Task deleted");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error(error);
      toast.error("Could not delete task");
    }
  };

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all",
        !showEditDialog && !showDeleteConfirm && "cursor-pointer"
      )}
      onClick={() => {
        if (!showEditDialog && !showDeleteConfirm) {
          router.push(`/projects/${projectId}/tasks/${task.id}`);
        }
      }}
    >
      {/* Priority Indicator Line */}
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 w-1",
          task.priority === "CRITICAL"
            ? "bg-red-500"
            : task.priority === "HIGH"
              ? "bg-orange-500"
              : task.priority === "MEDIUM"
                ? "bg-amber-500"
                : "bg-blue-500",
        )}
      ></div>

      <div className="absolute right-3 top-3 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActionsOpen((prev) => !prev);
          }}
          className="text-slate-400 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md transition"
          aria-label="Task actions"
        >
          <MoreHorizontal size={16} />
        </button>

        {actionsOpen && (
          <div
            className="mt-2 w-40 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-lg text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActionsOpen(false);
                setShowEditDialog(true);
              }}
              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <Pencil size={14} />
                Edit Task
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActionsOpen(false);
                setShowDeleteConfirm(true);
              }}
              className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <Trash2 size={14} />
                Delete Task
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start mb-3">
        <Badge variant={priorityMap[task.priority] || "default"}>
          {task.priority}
        </Badge>
      </div>

      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
          {task.description}
        </p>
      )}

      {task.image && (
        <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
          <Image
            src={task.image}
            alt="Task Attachment"
            width={300}
            height={128}
            className="w-full h-32 object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Calendar size={12} />
            <span>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No date"}
            </span>
          </div>
          {task.totalTime > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-500">
              <Clock size={12} />
              <span>{(task.totalTime / 3600).toFixed(1)}h</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
            {task.userId?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>

      {task.progress > 0 && (
        <ProgressBar progress={task.progress} size="sm" className="mt-4" />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete task"
        description="Are you sure you want to delete this task? This cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive
      />

      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onTaskUpdated={() => router.refresh()}
      />
    </div>
  );
}

