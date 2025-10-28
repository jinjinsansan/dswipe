'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import StickySiteHeader from '@/components/layout/StickySiteHeader';

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/points/purchase');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            決済が完了しました！
          </h1>
          <p className="text-slate-600 mb-8">
            ポイントが正常に付与されました。ご利用ありがとうございます。
          </p>

          {/* Details */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">決済方法</span>
              <span className="text-sm font-semibold text-slate-900">USDT (ONE.lat)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">決済状況</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                完了
              </span>
            </div>
          </div>

          {/* Auto Redirect Message */}
          <p className="text-sm text-slate-500 mb-6">
            {countdown}秒後にポイント購入ページに戻ります...
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/points/purchase"
              className="block w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              ポイント購入ページに戻る
            </Link>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              ダッシュボードへ
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
