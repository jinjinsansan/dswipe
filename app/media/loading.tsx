export default function MediaLoading() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4">
        <div className="h-10 w-full bg-slate-200 rounded mb-6 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-slate-200 rounded animate-pulse"></div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-200"></div>
                <div className="p-3">
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
