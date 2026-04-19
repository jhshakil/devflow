export default function NoteDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-12 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
            <div className="h-12 w-full bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <div className="h-4 w-16 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
            <div className="h-12 w-full bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
          <div className="h-96 w-full bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
          <div className="h-10 w-full bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="h-10 w-20 bg-slate-50 dark:bg-slate-800 rounded-md"></div>
          <div className="h-10 w-28 bg-indigo-100 dark:bg-indigo-900/20 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
