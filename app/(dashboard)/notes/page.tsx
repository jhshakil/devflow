import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, Search, FileText, Clock, Hash } from "lucide-react";
import Link from "next/link";

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

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>No notes found. Create your first note to get started.</p>
          </div>
        ) : (
          notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {note.title}
                </h3>
              </div>

              <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
                {note.content.substring(0, 150)}...
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                  >
                    <Hash size={10} />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={12} />
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
                {note.project && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: note.project.color }}
                    ></div>
                    <span className="text-[10px] font-medium text-slate-500">
                      {note.project.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
