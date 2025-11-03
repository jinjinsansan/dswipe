'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import StickySiteHeader from '@/components/layout/StickySiteHeader';

export default function NotePurchaseSuccessPage() {
  const params = useParams<{ slug?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const slug = useMemo(() => {
    const value = params?.slug;
    if (!value) return null;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const externalId = searchParams.get('external_id');

  useEffect(() => {
    if (!slug) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/notes/${slug}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, slug]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <StickySiteHeader showDashboardLink />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircleIcon className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">決済が完了しました！</h1>
            <p className="mb-8 text-sm text-slate-600">
              NOTE の購入が正常に完了しました。すぐに記事へ移動して内容をご確認ください。
            </p>
            <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
              <div className="mb-2 flex items-center justify-between">
                <span>決済ステータス</span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  完了
                </span>
              </div>
              {externalId ? (
                <div className="truncate text-xs text-slate-500">
                  トランザクションID: {externalId}
                </div>
              ) : null}
            </div>
            <p className="mb-6 text-xs text-slate-500">
              {slug ? `${countdown}秒後に自動で記事ページに戻ります...` : '記事ページに戻るリンクからお進みください。'}
            </p>
            <div className="space-y-3">
              {slug ? (
                <Link
                  href={`/notes/${slug}`}
                  className="block w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  記事ページへ移動する
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="block w-full rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
