export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-8 w-40 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-slate-200 rounded"></div>
            <div className="h-10 w-32 bg-slate-200 rounded"></div>
            <div className="h-10 w-24 bg-slate-200 rounded"></div>
          </div>
        </div>

        {/* Product Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200"></div>
              <div className="p-6">
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-slate-200 rounded mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                  <div className="h-8 w-20 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
