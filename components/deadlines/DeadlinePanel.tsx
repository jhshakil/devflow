import Countdown from "@/components/ui/Countdown";
import { Calendar, Bell, ChevronRight } from "lucide-react";

interface DeadlinePanelProps {
  deadlines: any[];
}

export default function DeadlinePanel({ deadlines }: DeadlinePanelProps) {
  if (deadlines.length === 0) return null;

  // Get soonest deadline
  const soonest = deadlines
    .filter((d) => new Date(d.dueDate) > new Date())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0];

  if (!soonest) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-indigo-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Bell size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">
            Next Major Milestone
          </h2>
          <p className="text-xl font-bold">{soonest.title}</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center justify-between">
        <Countdown targetDate={soonest.dueDate} />
        <div className="text-right border-l border-white/10 pl-6">
          <p className="text-[10px] uppercase font-bold opacity-60 mb-1">
            Due Date
          </p>
          <p className="text-sm font-bold">
            {new Date(soonest.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <button className="w-full mt-6 py-2.5 rounded-xl bg-white text-indigo-600 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
        <span>View Details</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
