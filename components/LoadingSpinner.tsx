export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Momentumロゴ - ゆっくり上下に動くアニメーション */}
        <div className="animate-bounce-slow">
          <svg
            width="80"
            height="80"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-xl"
          >
            <defs>
              <linearGradient id="loader-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="38" height="38" rx="11" fill="#0b1f3a" />
            <path
              d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z"
              fill="none"
              stroke="url(#loader-logo-grad)"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <path
              d="M25 20l6-5m-6 5l6 5"
              stroke="url(#loader-logo-grad)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* プログレスバー */}
        <div className="w-64 h-1.5 bg-tint-border rounded-full overflow-hidden">
          <div
            className="h-full animate-progress-slide rounded-full"
            style={{ backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' }}
          ></div>
        </div>

        {/* ローディングテキスト */}
        <p className="mt-2 text-ink-soft text-sm font-medium tracking-wider animate-pulse">
          読み込み中...
        </p>
      </div>
    </div>
  );
}

export function BlockSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-slate-200 rounded-xl mb-4"></div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 bg-slate-200 rounded-xl"></div>
      <div className="h-48 bg-slate-200 rounded-xl"></div>
      <div className="h-48 bg-slate-200 rounded-xl"></div>
    </div>
  );
}
