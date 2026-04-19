export default function ProjectDetailLoading() {
  return (
    <div className="h-full flex flex-col space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-900"></div>
          <div className="h-10 w-28 rounded-md bg-indigo-100 dark:bg-indigo-900/20"></div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex gap-6">
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          <div className="h-4 w-12 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
          <div className="h-4 w-16 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-48 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
          <div className="h-8 w-20 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md mb-6"></div>
            <div className="space-y-4">
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="h-32 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4"
                >
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-900 rounded-md mb-3"></div>
                  <div className="h-3 w-full bg-slate-50 dark:bg-slate-800 rounded-md mb-4"></div>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-900"></div>
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
