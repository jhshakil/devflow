"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Camera, Loader2, Save, User as UserIcon } from "lucide-react";
import { uploadFile, MAX_FILE_SIZE } from "@/lib/upload";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface UserProfile {
  id: string;
  name?: string | null;
  image?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
}

export default function ProfileForm({ user }: { user: UserProfile }) {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user.name || "",
    jobTitle: user.jobTitle || "",
    bio: user.bio || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = user.image;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile, `profiles/${user.id}`);
      }

      const res = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ ...formData, image: imageUrl }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update profile");

      await update({ name: formData.name, image: imageUrl });
      router.refresh();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Picture */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <UserIcon size={64} className="text-slate-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-colors"
          >
            <Camera size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-md py-2 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-md py-2 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Full Stack Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-md py-2 px-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
