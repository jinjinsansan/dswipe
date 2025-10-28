'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CurrencyYenIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { noteApi, publicApi } from '@/lib/api';
import type { PublicNoteDetail } from '@/types';
import NoteRenderer from './NoteRenderer';
import { getCategoryLabel } from '@/lib/noteCategories';

interface NoteDetailClientProps {
  slug: string;
}

type LoadingState = 'idle' | 'loading' | 'error';

type PurchaseState = 'idle' | 'processing' | 'success' | 'error';

const formatDate = (value?: string | null) => {
  if (!value) return '非公開';
  try {
    return new Date(value).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return value;
  }
};

export default function NoteDetailClient({ slug }: NoteDetailClientProps) {
  const router = useRouter();
  const { token, isAuthenticated, isInitialized, user, setUser } = useAuthStore();

  const [note, setNote] = useState<PublicNoteDetail | null>(null);
  const [loading, setLoading] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (!slug) return;
    setLoading('loading');
    setError(null);
    try {
      const response = await publicApi.getNote(slug, {
        accessToken: token ?? undefined,
      });
      setNote(response.data);
      setLoading('idle');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          const fallback = await publicApi.getNote(slug);
          setNote(fallback.data);
          setLoading('idle');
          setError(null);
          return;
        } catch (fallbackError: any) {
          const fallbackDetail = fallbackError?.response?.data?.detail;
          setError(typeof fallbackDetail === 'string' ? fallbackDetail : 'NOTEの取得に失敗しました');
        }
      } else {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'NOTEの取得に失敗しました');
      }
      setLoading('error');
    }
  }, [slug, token]);

  useEffect(() => {
    if (!isInitialized) return;
    fetchNote();
  }, [fetchNote, isInitialized]);

  const handlePurchase = async () => {
    if (!note) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setPurchaseState('processing');
    setPurchaseMessage(null);
    setPurchaseError(null);
    try {
      const response = await noteApi.purchase(note.id);
      setPurchaseState('success');
      setPurchaseMessage(
        `購入が完了しました。消費ポイント: ${response.data.points_spent.toLocaleString()}P / 残高: ${response.data.remaining_points.toLocaleString()}P`
      );
      if (user) {
        const nextUser = { ...user, point_balance: response.data.remaining_points };
        setUser(nextUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(nextUser));
        }
      }
      await fetchNote();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setPurchaseState('error');
      setPurchaseError(typeof detail === 'string' ? detail : '購入に失敗しました。もう一度お試しください。');
    }
  };

  const isAuthor = useMemo(() => {
    if (!note || !user) return false;
    return note.author_id === user.id;
  }, [note, user]);

  if (!isInitialized) {
    return (
      <div className="flex h-80 items-center justify-center text-slate-500">初期化中...</div>
    );
  }

  if (loading === 'loading') {
    return (
      <div className="flex h-80 items-center justify-center text-slate-500">
        <ArrowPathIcon className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        読み込み中...
      </div>
    );
  }

  if (loading === 'error' || !note) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
        {error ?? 'NOTEが見つかりませんでした'}
      </div>
    );
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {note.cover_image_url ? (
        <div className="relative h-60 w-full overflow-hidden rounded-3xl bg-slate-200">
          <Image src={note.cover_image_url} alt={note.title} fill className="object-cover" />
        </div>
      ) : null}

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
            NOTE
          </span>
          <span>公開日: {formatDate(note.published_at)}</span>
          <span>価格: {note.is_paid ? `${note.price_points.toLocaleString()} P` : '無料'}</span>
          <span>著者: @{note.author_username ?? 'unknown'}</span>
          {isAuthor ? <span className="font-semibold text-emerald-600">あなたの記事です</span> : null}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{note.title}</h1>
        {note.excerpt ? (
          <p className="text-base text-slate-600 sm:text-lg">{note.excerpt}</p>
        ) : null}
        {Array.isArray(note.categories) && note.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {note.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                #{getCategoryLabel(category)}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <NoteRenderer blocks={Array.isArray(note.content_blocks) ? note.content_blocks : []} />

        {note.is_paid && !note.has_access ? (
          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-center text-sm text-amber-700">
            <p className="font-semibold">この続きは有料コンテンツです</p>
            <p className="mt-2 text-xs text-amber-700/80">
              購入すると残りのコンテンツがすべて解放されます。
            </p>
            <div className="mt-4 flex flex-col items-center gap-3">
              {purchaseMessage ? (
                <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                  {purchaseMessage}
                </div>
              ) : null}
              {purchaseError ? (
                <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {purchaseError}
                </div>
              ) : null}
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchaseState === 'processing'}
                className={`inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 ${
                  purchaseState === 'processing' ? 'opacity-70' : ''
                }`}
              >
                <CurrencyYenIcon className={`h-4 w-4 ${purchaseState === 'processing' ? 'animate-pulse' : ''}`} aria-hidden="true" />
                {isAuthenticated ? `${note.price_points.toLocaleString()} ポイントで購入` : 'ログインして購入'}
              </button>
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="text-xs font-semibold text-blue-600 underline underline-offset-4"
                >
                  アカウントをお持ちでない場合はこちらからログイン/登録
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {note.is_paid && note.has_access ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            <span>有料コンテンツを解放済みです。ありがとうございます！</span>
          </div>
          {purchaseMessage ? (
            <p className="mt-2 text-xs text-emerald-600/80">{purchaseMessage}</p>
          ) : null}
        </div>
      ) : null}

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/notes"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            ← AllNOTEへ戻る
          </Link>
          <Link
            href="/note"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            NOTEダッシュボード
          </Link>
        </div>
        <span className="text-[10px] text-slate-400">@{note.author_username ?? 'unknown'}</span>
      </footer>
    </article>
  );
}
