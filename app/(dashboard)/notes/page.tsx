import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import NoteList from "@/components/notes/NoteList";

export default async function NotesPage() {
  const session = await auth();
  let notes = [];
  try {
    notes = await prisma.note.findMany({
      where: { userId: session?.user?.id },
      include: {
        project: { select: { name: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-bold mb-2">Connection Error</h2>
        <p>Could not reach the database. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Capture ideas, meeting minutes, and technical specs.
          </p>
        </div>
        <Link
          href="/notes/new"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>New Note</span>
        </Link>
      </div>

      <NoteList notes={notes} />
    </div>
  );
}
