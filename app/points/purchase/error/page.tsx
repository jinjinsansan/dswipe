'use client';

import Link from 'next/link';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import StickySiteHeader from '@/components/layout/StickySiteHeader';

export default function PurchaseErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            決済に失敗しました
          </h1>
          <p className="text-slate-600 mb-8">
            決済処理中にエラーが発生しました。再度お試しいただくか、サポートにお問い合わせください。
          </p>

          {/* Possible Reasons */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">考えられる原因</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span>決済がキャンセルされました</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span>ウォレットの残高が不足しています</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span>ネットワークエラーが発生しました</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span>決済がタイムアウトしました</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/points/purchase"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              再度購入する
            </Link>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              ダッシュボードへ戻る
            </Link>
            <button
              onClick={() => window.open('mailto:support@d-swipe.com', '_blank')}
              className="block w-full px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              サポートに問い合わせ
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
