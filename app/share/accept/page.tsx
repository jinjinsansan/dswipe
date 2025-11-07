'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { accountShareApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';

type AcceptState = 'loading' | 'success' | 'error';

function AccountShareAcceptContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<AcceptState>('loading');
  const [message, setMessage] = useState<string>('共有招待を承認しています…');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('招待トークンが見つかりませんでした。');
      return;
    }

    let isMounted = true;

    accountShareApi
      .acceptInvitation(token)
      .then(() => {
        if (!isMounted) return;
        setState('success');
        setMessage('共有招待を承認しました。ダッシュボードからアカウントを切り替えてご利用ください。');
      })
      .catch((error) => {
        if (!isMounted) return;
        const errorMessage = getErrorMessage(error);
        setState('error');
        setMessage(errorMessage || '共有招待を承認できませんでした。先にログインしているかを確認してください。');
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-slate-900">アカウント共有の承認</h1>
          <p className={`mt-4 text-sm ${state === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>{message}</p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              ダッシュボードに移動
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              ログイン画面を開く
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountShareAcceptFallback() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-slate-900">アカウント共有の承認</h1>
          <p className="mt-4 text-sm text-slate-600">共有招待を確認しています…</p>
        </div>
      </div>
    </main>
  );
}

export default function AccountShareAcceptPage() {
  return (
    <Suspense fallback={<AccountShareAcceptFallback />}>
      <AccountShareAcceptContent />
    </Suspense>
  );
}
