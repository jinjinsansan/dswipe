export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Dロゴ - ゆっくり上下に動くアニメーション */}
        <div className="animate-bounce-slow">
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            <rect width="32" height="32" rx="6" fill="#3B82F6"/>
            <text 
              x="16" 
              y="23" 
              fontFamily="Arial, sans-serif" 
              fontSize="20" 
              fontWeight="900" 
              fill="#FFFFFF" 
              textAnchor="middle"
            >
              D
            </text>
          </svg>
        </div>

        {/* プログレスバー */}
        <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-progress-slide rounded-full"></div>
        </div>

        {/* ローディングテキスト */}
        <p className="mt-2 text-slate-300 text-sm font-medium tracking-wider animate-pulse">
          読み込み中...
        </p>
      </div>
    </div>
  );
}

export function BlockSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-700 rounded-xl mb-4"></div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 bg-gray-800 rounded-xl"></div>
      <div className="h-48 bg-gray-800 rounded-xl"></div>
      <div className="h-48 bg-gray-800 rounded-xl"></div>
    </div>
  );
}
