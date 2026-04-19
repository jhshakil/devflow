"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, FileText, Hash, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface NoteListItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: Date;
  project?: { name: string; color: string } | null;
}

interface NoteListProps {
  notes: NoteListItem[];
}

export default function NoteList({ notes }: NoteListProps) {
  const router = useRouter();
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      ),
    [notes, search],
  );

  const handleDelete = async () => {
    if (!deletingNoteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${deletingNoteId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete note");
      }
      toast.success("Note deleted");
      setDeletingNoteId(null);
      setOpenMenuFor(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p>No notes found. Create your first note to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                  {note.title}
                </h3>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuFor((current) =>
                        current === note.id ? null : note.id,
                      );
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-md transition"
                    aria-label="Note actions"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuFor === note.id && (
                    <div
                      className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Link
                        href={`/notes/${note.id}`}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setOpenMenuFor(null)}
                      >
                        <FileText size={14} />
                        Edit Note
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingNoteId(note.id);
                          setOpenMenuFor(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 size={14} />
                        Delete Note
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/notes/${note.id}`} className="flex-1 text-left">
                <p className="text-sm text-slate-500 line-clamp-3 mb-6">
                  {note.content.substring(0, 150)}...
                </p>
              </Link>

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
                    />
                    <span className="text-[10px] font-medium text-slate-500">
                      {note.project.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingNoteId)}
        onOpenChange={(open) => {
          if (!open) setDeletingNoteId(null);
        }}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
