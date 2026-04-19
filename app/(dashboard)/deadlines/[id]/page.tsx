import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditDeadlineForm from "@/components/deadlines/EditDeadlineForm";

export default async function EditDeadlinePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const deadline = await prisma.deadline.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true, color: true, userId: true } } },
  });

  if (!deadline || deadline.project?.userId !== session?.user?.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/deadlines"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        Back to Deadlines
      </Link>
      <EditDeadlineForm deadline={deadline} />
    </div>
  );
}
