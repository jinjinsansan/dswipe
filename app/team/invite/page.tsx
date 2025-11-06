"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { teamApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type InviteStatus = 'idle' | 'loading' | 'success' | 'error';

const loadingFallback = (
  <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-16">
    <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">チーム招待の承認</h1>
        <p className="mt-2 text-sm text-slate-600">運営チームからの招待を確認しています。</p>
      </header>
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
        <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span>読み込み中です...</span>
      </div>
    </div>
  </main>
);

function TeamInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<InviteStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('招待トークンが見つかりません。メール内のリンクを再度ご確認ください。');
      return;
    }

    const accept = async () => {
      setStatus('loading');
      setMessage('招待を確認しています...');
      setDetail(null);
      try {
        await teamApi.acceptInvitation(token);
        setStatus('success');
        setMessage('チームに参加しました。共有ダッシュボードを開けます。');
        if (isAuthenticated) {
          setDetail('このままダッシュボードへ移動してください。');
        } else {
          setDetail('ログインすると共有ダッシュボードへアクセスできます。');
        }
      } catch (error) {
        console.error('Failed to accept team invitation', error);
        setStatus('error');
        if (isAxiosError(error)) {
          setMessage(error.response?.data?.detail ?? '招待の承認に失敗しました。');
        } else {
          setMessage('招待の承認に失敗しました。時間を置いて再度お試しください。');
        }
      }
    };

    void accept();
  }, [isAuthenticated, searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">チーム招待の承認</h1>
          <p className="mt-2 text-sm text-slate-600">運営チームからの招待を確認しています。</p>
        </header>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
          {status === 'loading' && (
            <div className="flex items-center gap-3">
              <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                <span className="font-semibold">{message}</span>
              </div>
              {detail && <p className="text-slate-600">{detail}</p>}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-rose-600">
                <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                <span className="font-semibold">{message}</span>
              </div>
              <p className="text-slate-600">リンクの有効期限が切れている場合は、招待元に再送を依頼してください。</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-white shadow-sm transition hover:bg-blue-700"
          >
            ダッシュボードへ
          </Link>
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2 text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
            >
              ログイン画面へ
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TeamInviteAcceptPage() {
  return (
    <Suspense fallback={loadingFallback}>
      <TeamInviteContent />
    </Suspense>
  );
}
