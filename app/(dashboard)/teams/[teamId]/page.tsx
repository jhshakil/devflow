"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Mail, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type TeamDetail = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  projects: { id: string }[];
  members: {
    userId: string;
    role: string;
    user: { name: string; email: string; image: string | null; id: string };
  }[];
};

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailToInvite, setEmailToInvite] = useState("");
  const [inviting, setInviting] = useState(false);

  const fetchTeamData = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/teams");
        return;
      }
      const data = await res.json();
      setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [teamId, router]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToInvite, role: "MEMBER" }),
      });
      if (res.ok) {
        setEmailToInvite("");
        fetchTeamData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to invite");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This action is irreversible.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
      if (res.ok) router.push("/teams");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-gray-500 text-center">
        Loading team details...
      </div>
    );
  if (!team)
    return (
      <div className="p-8 text-red-500 text-center">Failed to load team.</div>
    );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <Link
        href="/teams"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Teams
      </Link>

      <div className="bg-gradient-to-r from-gray-900 via-gray-900/80 to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              {team.name}
            </h1>
            {team.description && (
              <p className="text-gray-400 mt-2 text-lg">{team.description}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
            title="Delete Team"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white/90">
              <Users className="w-5 h-5 text-indigo-400" /> Members
            </h2>
            <div className="space-y-4">
              {team.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {member.user.image ? (
                      <div className="w-10 h-10 rounded-full border border-white/10 relative overflow-hidden">
                        <Image
                          src={member.user.image}
                          fill
                          alt={member.user.name}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold select-none text-sm">
                        {member.user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white/90">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-medium px-3 py-1 bg-white/5 text-gray-300 rounded-full border border-white/10">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white/90">
              <UserPlus className="w-5 h-5 text-indigo-400" /> Invite Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  User Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={emailToInvite}
                    onChange={(e) => setEmailToInvite(e.target.value)}
                    placeholder="teammate@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                disabled={inviting}
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all"
              >
                {inviting ? "Inviting..." : "Send Invite"}
              </button>
            </form>
          </div>

          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2 text-white/90">Team Stats</h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                <span className="text-gray-400 text-sm">Projects</span>
                <span className="font-mono font-bold text-indigo-400">
                  {team.projects.length}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                <span className="text-gray-400 text-sm">Members</span>
                <span className="font-mono font-bold text-indigo-400">
                  {team.members.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
