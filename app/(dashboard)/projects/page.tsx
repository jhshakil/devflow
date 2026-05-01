import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Folder } from "lucide-react";
import ProjectsList from "@/components/projects/ProjectsList";

export default async function ProjectsPage() {
  const session = await auth();

  // In a real app, I'd fetch from API or Prisma directly in server component
  const userId = session?.user?.id;
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { userId: userId },
        { team: { members: { some: { userId: userId } } } },
      ],
    },
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
        <ProjectsList projects={projects} />
      )}
    </div>
  );
}
