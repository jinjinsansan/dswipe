export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-24 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Navigation Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow animate-pulse">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
