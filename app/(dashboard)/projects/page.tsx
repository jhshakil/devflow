import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Folder, MoreVertical } from "lucide-react";

export default async function ProjectsPage() {
  const session = await auth();

  // In a real app, I'd fetch from API or Prisma directly in server component
  const projects = await prisma.project.findMany({
    where: { userId: session?.user?.id },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your workspace projects and teams.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-900">
            <Folder className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No projects</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating a new project.
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-white border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: project.color }}
                >
                  {project.name.charAt(0)}
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="mt-4 flex-1">
                <h3 className="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {project.description || "No description provided."}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {project._count.tasks} Tasks
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
