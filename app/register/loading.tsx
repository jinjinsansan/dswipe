export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-8 animate-pulse">
          {/* Logo/Title Area */}
          <div className="text-center mb-8">
            <div className="h-10 w-48 bg-slate-200 rounded mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 rounded mx-auto"></div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-12 w-full bg-slate-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-12 w-full bg-slate-200 rounded"></div>
            </div>
            <div>
              <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-12 w-full bg-slate-200 rounded"></div>
            </div>
            <div className="h-12 w-full bg-slate-200 rounded mt-6"></div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="h-4 w-48 bg-slate-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
