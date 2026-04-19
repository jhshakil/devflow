import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditProjectForm from "@/components/projects/EditProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id, userId: session?.user?.id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        Back to Project
      </Link>
      <EditProjectForm project={project} />
    </div>
  );
}
