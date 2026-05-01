"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, LayoutDashboard, ChevronRight } from "lucide-react";

type Team = {
  id: string;
  name: string;
  description: string | null;
  _count: { projects: number };
  members: { user: { name: string; image: string | null } }[];
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchTeamsData = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        fetchTeamsData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white/90">
            Teams
          </h1>
          <p className="text-gray-400 mt-2">
            Collaborate with others on projects and tasks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Team
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-gray-500"
                  placeholder="e.g. Frontend Squad"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-white placeholder-gray-500 min-h-[100px]"
                  placeholder="What is this team for?"
                />
              </div>
              <button
                disabled={creating}
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
              >
                {creating ? "Creating..." : "Create Team"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/30 border border-dashed border-white/10 rounded-2xl">
              <Users className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">
                No teams yet
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Create a team to start collaborating on projects with others.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="group block"
                >
                  <div className="bg-gray-900/40 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 rounded-2xl p-6 hover:bg-gray-900/60 shadow-xl relative overflow-hidden group-hover:shadow-indigo-500/10">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <ChevronRight className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-white/90">
                        {team.name}
                      </h3>
                    </div>
                    {team.description && (
                      <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6 mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{team.members.length} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{team._count.projects} projects</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
