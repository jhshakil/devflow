import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabels?: boolean;
}

export default function ProgressBar({
  progress,
  size = "md",
  className,
  showLabels = false,
}: ProgressBarProps) {
  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabels && (
        <div className="flex justify-between text-[10px] text-slate-500 font-medium uppercase tracking-widest">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden",
          heights[size],
        )}
      >
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
