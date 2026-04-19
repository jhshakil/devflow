import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TaskBoard from "@/components/tasks/TaskBoard";
import { Plus, Settings, Search, Filter } from "lucide-react";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";

export default async function ProjectDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const session = await auth();
  const project = await prisma.project.findUnique({
    where: { id, userId: session?.user?.id },
    include: {
      tasks: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {project.description || "Project Workspace"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors">
            <Settings size={18} className="text-slate-500" />
          </button>
          <NewTaskDialog projectId={project.id} />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium border-b-2 border-indigo-600 pb-4 -mb-4 transition-colors">
            Board
          </button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4 transition-colors">
            List
          </button>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-4 -mb-4 transition-colors">
            Timeline
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-indigo-500 outline-none w-48"
            />
          </div>
          <button className="flex items-center gap-1.5 p-2 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <TaskBoard project={project} initialTasks={project.tasks} />
      </div>
    </div>
  );
}
