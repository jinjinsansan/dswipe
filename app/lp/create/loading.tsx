export default function CreateLPLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-slate-200 rounded"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 animate-pulse">
          <div>
            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-12 w-full bg-slate-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-32 w-full bg-slate-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-28 bg-slate-200 rounded mb-2"></div>
            <div className="h-12 w-full bg-slate-200 rounded"></div>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="h-12 flex-1 bg-slate-200 rounded"></div>
            <div className="h-12 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
