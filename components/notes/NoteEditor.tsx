"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { uploadFile, MAX_FILE_SIZE } from "@/lib/upload";
import { useSession } from "next-auth/react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  initialProjectId?: string;
  projects?: { id: string; name: string }[];
  onSave: (data: {
    title: string;
    content: string;
    tags: string[];
    projectId: string | null;
  }) => Promise<void>;
}

export default function NoteEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  initialProjectId = "",
  projects = [],
  onSave,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [projectId, setProjectId] = useState(initialProjectId);
  const [saving, setSaving] = useState(false);
  const { data: session } = useSession();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    try {
      const url = await uploadFile(file, `notes/${session.user.id}`);
      const imageMarkdown = `\n![${file.name}](${url})\n`;
      setContent((prev) => prev + imageMarkdown);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title,
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        projectId: !projectId || projectId === "none" ? null : projectId,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-color-mode="light">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Note Title"
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Project
          </label>
          <select
            value={projectId || "none"}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="none">Standalone (No Project)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Content (Markdown)
            </label>
            <div className="relative">
              <input
                type="file"
                id="note-image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="note-image-upload"
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer"
              >
                <ImagePlus size={14} />
                Attach Image
              </label>
            </div>
          </div>
          <MDEditor
            value={content}
            onChange={(v) => setContent(v || "")}
            height={400}
            preview="edit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. backend, meeting, api"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
