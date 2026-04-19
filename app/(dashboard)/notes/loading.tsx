export default function NotesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-indigo-100 dark:bg-indigo-900/20 rounded-md"></div>
      </div>

      <div className="h-14 w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm"
          >
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-md"></div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-md"></div>
              <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 w-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"></div>
              <div className="h-5 w-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"></div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
