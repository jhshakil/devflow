"use client";

import { formatDuration } from "@/lib/time";
import { Clock, Pause, AlertCircle, CheckCircle2 } from "lucide-react";
import type { TimeLog } from "@/lib/types";

interface TaskTimelineProps {
  timeLogs: TimeLog[];
}

export default function TaskTimeline({ timeLogs }: TaskTimelineProps) {
  if (!timeLogs || timeLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-40">
        <Clock size={32} className="mb-2" />
        <p className="text-sm">No time logs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {timeLogs.map((log, logIdx) => {
          const isEnded = !!log.endedAt || !!log.pausedAt;
          const endedAt = log.endedAt ?? log.pausedAt;
          const statusIcon =
            log.logType === "ACTIVE"
              ? log.endedAt
                ? CheckCircle2
                : Clock
              : log.logType === "PAUSED"
                ? Pause
                : AlertCircle;
          const statusColor =
            log.logType === "ACTIVE"
              ? "bg-green-500"
              : log.logType === "PAUSED"
                ? "bg-slate-400"
                : "bg-amber-500";

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== timeLogs.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-950 ${statusColor} text-white`}
                    >
                      {log.logType === "ACTIVE" && log.endedAt ? (
                        <CheckCircle2 size={16} />
                      ) : log.logType === "WAITING" ? (
                        <AlertCircle size={16} />
                      ) : log.logType === "PAUSED" ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Clock size={16} />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {log.logType === "ACTIVE"
                          ? "Working session"
                          : log.logType === "WAITING"
                            ? "Waiting for dependency"
                            : "Manual break"}
                        {log.reason && (
                          <span className="font-normal text-slate-500 italic ml-2">
                            — &quot;{log.reason}&quot;
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>
                          {new Date(log.startedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(log.startedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isEnded && (
                          <>
                            <span>→</span>
                            <span>
                              {new Date(
                                endedAt!,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm font-bold text-slate-900 dark:text-slate-200">
                      {log.duration
                        ? formatDuration(log.duration)
                        : isRunning(log)
                          ? "Running"
                          : "Incomplete"}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isRunning(log: TimeLog) {
  return !log.endedAt && !log.pausedAt;
}
