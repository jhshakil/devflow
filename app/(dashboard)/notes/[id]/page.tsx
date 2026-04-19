/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

export default function NoteDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [note, setNote] = useState<any>(null); // Ideally Note from Prisma
  const [projects, setProjects] = useState<any[]>([]); // Ideally Project[] from Prisma
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const id = params.id;
  const isNew = id === "new";

  useEffect(() => {
    async function fetchData() {
      try {
        const projectsRes = await fetch("/api/projects");
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        if (!isNew) {
          const noteRes = await fetch(`/api/notes/${id}`);
          if (noteRes.ok) {
            const noteData = await noteRes.json();
            setNote(noteData);
          } else {
            router.push("/notes");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, isNew, router]);

  const handleSave = async (data: {
    title: string;
    content: string;
    tags: string[];
    projectId: string | null;
  }) => {
    const url = isNew ? "/api/notes" : `/api/notes/${id}`;
    const method = isNew ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(isNew ? "Note created" : "Note updated");
      router.push("/notes");
      router.refresh();
    } else {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note deleted");
        router.push("/notes");
        router.refresh();
      } else {
        toast.error("Failed to delete note");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading note editor...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/notes"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Notes</span>
        </Link>
        {!isNew && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <NoteEditor
          initialTitle={note?.title}
          initialContent={note?.content}
          initialTags={note?.tags}
          initialProjectId={note?.projectId}
          projects={projects}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
