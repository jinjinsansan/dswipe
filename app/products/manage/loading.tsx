export default function ProductsManageLoading() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-200 rounded animate-pulse"></div>
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded"></div>
            <div className="h-10 w-32 bg-slate-200 rounded"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
                <div className="h-8 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-6 w-40 bg-slate-200 rounded"></div>
                  <div className="h-6 w-16 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-9 flex-1 bg-slate-200 rounded"></div>
                  <div className="h-9 w-20 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
