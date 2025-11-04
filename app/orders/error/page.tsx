'use client';

import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import type { JSX } from 'react';

import StickySiteHeader from '@/components/layout/StickySiteHeader';

export default function ProductOrderErrorPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
                <ExclamationTriangleIcon className="h-12 w-12 text-rose-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">決済が完了しませんでした</h1>
            <p className="mb-6 text-sm text-slate-600">
              決済がキャンセルされたか、途中でエラーが発生した可能性があります。もう一度やり直すか、詳細については運営までお問い合わせください。
            </p>
            <div className="space-y-3">
              <Link
                href="/products"
                className="block w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                商品一覧に戻る
              </Link>
              <Link
                href="/operator/messages"
                className="block w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                運営からのお知らせを確認する
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
