'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FunnelIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { publicApi } from '@/lib/api';
import type { PublicNoteSummary } from '@/types';
import { NOTE_CATEGORY_OPTIONS, getCategoryLabel } from '@/lib/noteCategories';

const PAGE_SIZE = 60;

type FilterValue = 'all' | 'free' | 'paid';

type LoadingState = 'idle' | 'loading' | 'error';

export default function NotesMarketplacePage() {
  const [notes, setNotes] = useState<PublicNoteSummary[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading('loading');
      setError(null);
      try {
        const response = await publicApi.listNotes({
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          categories: categoryFilter !== 'all' ? [categoryFilter] : undefined,
        });
        setNotes(response.data?.data ?? []);
        setLoading('idle');
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : '記事一覧の取得に失敗しました');
        setLoading('error');
      }
    };

    fetchNotes();
  }, [debouncedSearch, categoryFilter]);

  const filteredNotes = useMemo(() => {
    const base = categoryFilter === 'all'
      ? notes
      : notes.filter((note) => Array.isArray(note.categories) && note.categories.includes(categoryFilter));
    if (filter === 'all') return base;
    return base.filter((note) => (filter === 'paid' ? note.is_paid : !note.is_paid));
  }, [notes, filter, categoryFilter]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:gap-12 sm:py-20">
        <header className="space-y-4 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-slate-700"
          >
            ← ダッシュボードに戻る
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">NOTE marketplace</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">AllNOTES</h1>
          </div>
          <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
            情報発信者が投稿したNOTE記事をここで発見できます。無料記事はすぐに閲覧でき、有料記事はポイントでアンロック可能です。
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {([
                { value: 'all', label: 'すべて' },
                { value: 'free', label: '無料記事' },
                { value: 'paid', label: '有料記事' },
              ] as Array<{ value: FilterValue; label: string }>).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filter === option.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FunnelIcon className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:w-72">
              <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="記事タイトル・概要で検索"
                className="h-8 w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 -mx-3">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-3 pb-2 sm:flex-wrap sm:overflow-visible">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全カテゴリー
              </button>
              {NOTE_CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategoryFilter(option.value)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    categoryFilter === option.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading === 'loading' ? (
          <div className="flex h-60 items-center justify-center text-sm text-slate-500">
            <SpinIndicator /> 読み込み中...
          </div>
        ) : loading === 'error' ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        ) : filteredNotes.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">記事が見つかりませんでした</h2>
            <p className="mt-3 text-sm text-slate-600">
              条件を変更するか、キーワードを変えて再検索してください。無料記事と有料記事を切り替えることもできます。
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              新しいNOTEは順次追加予定です
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  {note.cover_image_url ? (
                    <Image
                      src={note.cover_image_url}
                      alt={note.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <DefaultCover />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 px-5 py-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        note.is_paid
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {note.is_paid ? '有料' : '無料'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {note.published_at ? new Date(note.published_at).toLocaleDateString('ja-JP') : '未公開'}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{note.title}</h3>
                  {note.excerpt ? (
                    <p className="line-clamp-3 text-sm text-slate-600">{note.excerpt}</p>
                  ) : (
                    <p className="text-sm text-slate-500">概要未設定の記事です。</p>
                  )}
                  {Array.isArray(note.categories) && note.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {note.categories.map((category) => (
                        <span
                          key={`${note.id}-${category}`}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                        >
                          #{getCategoryLabel(category)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span>@{note.author_username ?? 'unknown'}</span>
                    <span>
                      {note.is_paid ? `${note.price_points.toLocaleString()} P` : 'FREE'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function SpinIndicator() {
  return <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-r-transparent" />;
}

function DefaultCover() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400">
      <SparklesIcon className="h-8 w-8" aria-hidden="true" />
    </div>
  );
}
