import { TimeLog } from "./generated/client";

export function calculateTaskTimeSummary(timeLogs: TimeLog[]) {
  const activeTime = timeLogs
    .filter((log) => log.logType === "ACTIVE" && log.duration)
    .reduce((sum, log) => sum + (log.duration ?? 0), 0);

  const waitingTime = timeLogs
    .filter((log) => log.logType === "WAITING" && log.duration)
    .reduce((sum, log) => sum + (log.duration ?? 0), 0);

  const pausedTime = timeLogs
    .filter((log) => log.logType === "PAUSED" && log.duration)
    .reduce((sum, log) => sum + (log.duration ?? 0), 0);

  return {
    activeTime,
    waitingTime,
    pausedTime,
    totalTime: activeTime + waitingTime + pausedTime,
  };
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "0h 0m 0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}
