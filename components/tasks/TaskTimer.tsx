"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, AlertCircle } from "lucide-react";
import { formatDuration, calculateTaskTimeSummary } from "@/lib/time";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PromptDialog } from "@/components/shared/PromptDialog";
import { toast } from "sonner";
import type { Task, TimeLog } from "@/lib/types";

interface TaskTimerProps {
  task: Task;
  initialTimeLogs: TimeLog[];
}

export default function TaskTimer({ task, initialTimeLogs }: TaskTimerProps) {
  const router = useRouter();
  const initialRunningLog = initialTimeLogs.find(
    (log) => !log.endedAt && !log.pausedAt,
  );

  const [isRunning, setIsRunning] = useState(!!initialRunningLog);
  const [currentTime, setCurrentTime] = useState(() => {
    if (initialRunningLog) {
      const startTime = new Date(initialRunningLog.startedAt).getTime();
      return Math.floor((Date.now() - startTime) / 1000);
    }
    return 0;
  });
  const [loading, setLoading] = useState(false);
  const [summary] = useState(calculateTaskTimeSummary(initialTimeLogs));
  const [showPausePrompt, setShowPausePrompt] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [pauseType, setPauseType] = useState<"PAUSED" | "WAITING">("PAUSED");

  // Live clock tick
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/time/start`, {
        method: "POST",
      });
      if (res.ok) {
        setIsRunning(true);
        setCurrentTime(0);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (reason: string) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}/time/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, logType: pauseType }),
      });
      if (res.ok) {
        setIsRunning(false);
        toast.success(`Task ${pauseType.toLowerCase()}`);
        router.refresh();
      } else {
        toast.error("Failed to pause task");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/time/resume`, {
        method: "POST",
      });
      if (res.ok) {
        setIsRunning(true);
        setCurrentTime(0);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/time/stop`, {
        method: "POST",
      });
      if (res.ok) {
        setIsRunning(false);
        toast.success("Task completed!");
        router.push(`/projects/${task.projectId}`);
      } else {
        toast.error("Failed to stop task");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden relative">
      {/* Active Indicator Top Bar */}
      {isRunning && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 animate-pulse"></div>
      )}

      <div className="text-center space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Track Work
        </h2>

        <div className="text-5xl font-mono font-bold tracking-tighter tabular-nums py-4">
          {isRunning ? formatDuration(currentTime) : "0h 0m 0s"}
        </div>

        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <button
              onClick={
                initialTimeLogs.some((l) => !l.endedAt)
                  ? handleResume
                  : handleStart
              }
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
            >
              <Play size={18} fill="currentColor" />
              {initialTimeLogs.some((l) => !l.endedAt)
                ? "Resume"
                : "Start Tracking"}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPauseType("PAUSED");
                  setShowPausePrompt(true);
                }}
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <Pause size={18} fill="currentColor" />
                Pause
              </button>
              <button
                onClick={() => {
                  setPauseType("WAITING");
                  setShowPausePrompt(true);
                }}
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-amber-50 hover:bg-amber-100 px-5 py-2.5 text-sm font-bold text-amber-700 transition-all dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 disabled:opacity-50"
              >
                <AlertCircle size={18} />
                Wait
              </button>
              <button
                onClick={() => setShowStopConfirm(true)}
                disabled={loading}
                className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              >
                <Square size={18} fill="currentColor" />
                Stop
              </button>
            </div>
          )}
        </div>
      </div>

      <PromptDialog
        isOpen={showPausePrompt}
        onOpenChange={setShowPausePrompt}
        title={`Pause as ${pauseType.toLowerCase()}`}
        description="Please provide a reason for pausing your work."
        onConfirm={handlePause}
        placeholder="e.g. Lunch break, meeting, blocker..."
      />

      <ConfirmDialog
        isOpen={showStopConfirm}
        onOpenChange={setShowStopConfirm}
        title="Complete Task"
        description="Are you sure you want to stop tracking and mark this task as DONE?"
        onConfirm={handleStop}
        confirmLabel={loading ? "Saving..." : "Mark as Done"}
      />

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">
            Total Active
          </p>
          <p className="text-sm font-semibold">
            {formatDuration(summary.activeTime + (isRunning ? currentTime : 0))}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">
            Total Wait
          </p>
          <p className="text-sm font-semibold">
            {formatDuration(summary.waitingTime)}
          </p>
        </div>
      </div>
    </div>
  );
}
