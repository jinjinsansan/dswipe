'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FunnelIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { publicApi } from '@/lib/api';
import type { PublicNoteSummary } from '@/types';
import { NOTE_CATEGORY_OPTIONS, getCategoryLabel } from '@/lib/noteCategories';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

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
    <DashboardLayout pageTitle="AllNOTES" pageSubtitle="情報発信者が投稿したNOTE記事をここで発見できます" requireAuth={false}>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-6 sm:px-6 sm:gap-12">

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
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredNotes.map((note) => {
              const primaryCategory = note.categories?.[0];
              const categoryLabel = primaryCategory ? getCategoryLabel(primaryCategory) : null;
              const dateLabel = note.published_at
                ? new Date(note.published_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
                : '未公開';
              const priceLabel = note.is_paid
                ? note.allow_point_purchase
                  ? `${note.price_points.toLocaleString()} pt`
                  : note.allow_jpy_purchase && note.price_jpy
                    ? `${note.price_jpy.toLocaleString()} 円`
                    : '有料'
                : 'FREE';

              return (
                <Link
                  key={note.id}
                  href={`/notes/${note.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0 hover:border-blue-300 hover:shadow-md md:flex-col md:items-stretch md:overflow-hidden md:gap-0"
                >
                  <div className="relative h-20 w-24 flex-none overflow-hidden rounded-lg bg-slate-100 md:h-auto md:w-full md:rounded-none md:rounded-t-xl md:aspect-[3/2]">
                    {note.cover_image_url ? (
                      <Image
                        src={note.cover_image_url}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <DefaultCover />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2 px-3 py-3 md:px-4 md:py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 md:text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide md:text-[11px] ${
                            note.is_paid
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {note.is_paid ? '有料' : '無料'}
                        </span>
                        {categoryLabel ? (
                          <span className="text-[10px] font-medium text-slate-400 md:text-[11px]">
                            #{categoryLabel}
                            {note.categories.length > 1 ? ' 他' : ''}
                          </span>
                        ) : null}
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 md:text-[11px]">
                          {dateLabel}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 md:text-base">{note.title}</h3>
                      {note.excerpt ? (
                        <p className="line-clamp-2 text-xs text-slate-600 md:text-sm">{note.excerpt}</p>
                      ) : (
                        <p className="text-xs text-slate-500 md:text-sm">概要未設定の記事です。</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 md:text-xs">
                      <span className="font-medium text-slate-500">@{note.author_username ?? 'unknown'}</span>
                      <span className={`${note.is_paid ? 'text-amber-600' : 'text-emerald-600'} font-semibold`}>
                        {priceLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </DashboardLayout>
  );
}

function SpinIndicator() {
  return <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-r-transparent" />;
}

function DefaultCover() {
  return (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400">
      <SparklesIcon className="h-8 w-8" aria-hidden="true" />
    </div>
  );
}
