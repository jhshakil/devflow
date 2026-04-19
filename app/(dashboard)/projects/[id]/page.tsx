import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectDetailClient from "@/components/ProjectDetailClient";

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

  return <ProjectDetailClient project={project} initialTasks={project.tasks} />;
}
