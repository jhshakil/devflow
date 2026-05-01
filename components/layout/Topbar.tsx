"use client";

import { useSession } from "next-auth/react";
import { Search, Loader2, Folder, CheckSquare, Users } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    projects: { id: string; name: string; color: string }[];
    tasks: { id: string; title: string; status: string; projectId: string }[];
    teams: { id: string; name: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path: string) => {
    setShowDropdown(false);
    setQuery("");
    router.push(path);
  };

  const hasResults =
    results &&
    (results.projects.length > 0 ||
      results.tasks.length > 0 ||
      results.teams.length > 0);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setShowDropdown(true);
              if (!val.trim()) setResults(null);
            }}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
            placeholder="Search tasks, notes, projects..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md py-2 pl-9 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-500 text-slate-900 dark:text-white"
          />
          {loading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 animate-spin" />
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && query.trim() && (
          <div className="absolute top-12 left-0 w-full lg:w-[150%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
            {loading && !results ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Searching...
              </div>
            ) : hasResults ? (
              <div className="max-h-96 overflow-y-auto w-full">
                {results.projects.length > 0 && (
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Projects
                    </div>
                    {results.projects.map((p) => (
                      <button
                        key={`p-${p.id}`}
                        onClick={() => handleSelect(`/projects/${p.id}`)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                      >
                        <Folder className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium dark:text-slate-200">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.teams.length > 0 && (
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Teams
                    </div>
                    {results.teams.map((t) => (
                      <button
                        key={`t-${t.id}`}
                        onClick={() => handleSelect(`/teams/${t.id}`)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                      >
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium dark:text-slate-200">
                          {t.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.tasks.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Tasks
                    </div>
                    {results.tasks.map((t) => (
                      <button
                        key={`t-${t.id}`}
                        onClick={() => handleSelect(`/tasks/${t.id}`)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium dark:text-slate-200">
                            {t.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {t.status.replace("_", " ")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                {` No results found for "${query}".`}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />

        <Link
          href="/profile"
          className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium dark:text-slate-200">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {session?.user?.id ? "Developer" : "Guest"}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              session?.user?.name?.charAt(0) || "U"
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
