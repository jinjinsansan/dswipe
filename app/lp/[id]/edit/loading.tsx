export default function EditLPLoading() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 h-14 flex-shrink-0">
        <div className="h-full px-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-slate-200 rounded"></div>
            <div className="h-6 w-48 bg-slate-200 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
            <div className="h-8 w-24 bg-slate-200 rounded"></div>
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block List */}
        <div className="w-64 bg-slate-100/50 border-r border-slate-200 p-4 space-y-4">
          <div className="h-10 w-full bg-slate-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-16 w-full bg-white rounded border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 bg-white overflow-y-auto p-8">
          <div className="max-w-md mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 rounded-xl p-8 animate-pulse">
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-slate-200 rounded mb-6"></div>
                <div className="h-12 w-40 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-96 bg-slate-100/50 border-l border-slate-200 p-4">
          <div className="h-8 w-32 bg-slate-200 rounded mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                <div className="h-10 w-full bg-white border border-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
