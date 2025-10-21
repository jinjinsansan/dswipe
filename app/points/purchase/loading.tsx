export default function PointsPurchaseLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-8 w-32 bg-slate-200 rounded"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Point Packages */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6"></div>
            
            {/* Package Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                  <div className="h-6 w-32 bg-slate-200 rounded mb-3"></div>
                  <div className="h-10 w-24 bg-slate-200 rounded mb-4"></div>
                  <div className="h-12 w-full bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Payment Methods Skeleton */}
            <div className="mt-8">
              <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-10 w-full bg-slate-200 rounded mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
