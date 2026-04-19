"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  targetDate: Date | string;
  className?: string;
}

export default function Countdown({ targetDate, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const isCritical = timeLeft.d === 0 && timeLeft.h < 24;

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <div
        className={cn(
          "flex flex-col items-center",
          isCritical ? "text-red-500" : "text-indigo-600 dark:text-indigo-400",
        )}
      >
        <span className="text-xl font-bold font-mono tabular-nums leading-none">
          {timeLeft.d}
        </span>
        <span className="text-[8px] uppercase font-bold tracking-tighter">
          Days
        </span>
      </div>
      <span className="text-slate-300 -mt-2">:</span>
      <div
        className={cn(
          "flex flex-col items-center",
          isCritical ? "text-red-500" : "text-indigo-600 dark:text-indigo-400",
        )}
      >
        <span className="text-xl font-bold font-mono tabular-nums leading-none">
          {timeLeft.h.toString().padStart(2, "0")}
        </span>
        <span className="text-[8px] uppercase font-bold tracking-tighter">
          Hrs
        </span>
      </div>
      <span className="text-slate-300 -mt-2">:</span>
      <div
        className={cn(
          "flex flex-col items-center",
          isCritical ? "text-red-500" : "text-indigo-600 dark:text-indigo-400",
        )}
      >
        <span className="text-xl font-bold font-mono tabular-nums leading-none">
          {timeLeft.m.toString().padStart(2, "0")}
        </span>
        <span className="text-[8px] uppercase font-bold tracking-tighter">
          Min
        </span>
      </div>
    </div>
  );
}
