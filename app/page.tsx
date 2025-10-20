import Link from 'next/link';
import { DevicePhoneMobileIcon, ChartBarIcon, CurrencyYenIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-semibold text-slate-900 mb-6 tracking-[0.08em]">
            Ｄ－swipe
          </h1>
          <p className="text-2xl text-slate-600 mb-12">
            スワイプ型LPを簡単に作成・公開
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
            >
              新規登録
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <DevicePhoneMobileIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">スワイプ型LP</h3>
              <p className="text-slate-600">
                縦・横スワイプ対応の魅力的なランディングページを作成
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ChartBarIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">詳細な分析</h3>
              <p className="text-slate-600">
                閲覧数、クリック率、ファネル分析で効果を可視化
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <CurrencyYenIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">ポイント決済</h3>
              <p className="text-slate-600">
                ポイントベースのシンプルな決済システム
              </p>
            </div>
          </div>

          <div className="mt-16 text-sm text-slate-500">
            <p>Backend API: <a href="https://swipelaunch-backend.onrender.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 hover:underline">API Documentation</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
