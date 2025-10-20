import Link from 'next/link';
import { DevicePhoneMobileIcon, ChartBarIcon, CurrencyYenIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-[0.08em]">
            Ｄ－swipe
          </h1>
          <p className="text-2xl text-gray-300 mb-12">
            スワイプ型LPを簡単に作成・公開
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-gray-800 text-white border-2 border-gray-700 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              新規登録
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-700/60 text-white">
                <DevicePhoneMobileIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">スワイプ型LP</h3>
              <p className="text-gray-400">
                縦・横スワイプ対応の魅力的なランディングページを作成
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-700/60 text-white">
                <ChartBarIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">詳細な分析</h3>
              <p className="text-gray-400">
                閲覧数、クリック率、ファネル分析で効果を可視化
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-700/60 text-white">
                <CurrencyYenIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">ポイント決済</h3>
              <p className="text-gray-400">
                ポイントベースのシンプルな決済システム
              </p>
            </div>
          </div>

          <div className="mt-16 text-sm text-gray-500">
            <p>Backend API: <a href="https://swipelaunch-backend.onrender.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">API Documentation</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
