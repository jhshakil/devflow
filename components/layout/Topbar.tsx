"use client";

import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import Link from "next/link";
import Image from "next/image";

export default function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search tasks, notes, projects..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
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
