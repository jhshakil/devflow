import Link from "next/link";
import { MoreHorizontal, Calendar, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  progress: number;
  dueDate?: string | Date | null;
  totalTime: number;
  userId: string;
  image?: string | null;
}

interface TaskCardProps {
  task: TaskItem;
  projectId: string;
}

export default function TaskCard({ task, projectId }: TaskCardProps) {
  const priorityMap: Record<string, "error" | "warning" | "info" | "default"> =
    {
      CRITICAL: "error",
      HIGH: "error",
      MEDIUM: "warning",
      LOW: "info",
    };

  return (
    <Link
      href={`/projects/${projectId}/tasks/${task.id}`}
      className="group block p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
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

      <div className="flex justify-between items-start mb-3">
        <Badge variant={priorityMap[task.priority] || "default"}>
          {task.priority}
        </Badge>
        <button className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 italic">
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
    </Link>
  );
}
