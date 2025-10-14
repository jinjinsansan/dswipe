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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-white text-lg">読み込み中...</p>
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
