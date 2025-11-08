'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FunnelIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useFormatter, useTranslations, useLocale } from 'next-intl';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { publicApi } from '@/lib/api';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';
import type { PublicNoteSummary } from '@/types';
const PAGE_SIZE = 60;

type FilterValue = 'all' | 'free' | 'paid';
type LoadingState = 'idle' | 'loading' | 'error';

export interface NotesMarketplacePageProps {
  basePath?: string;
}

const withBasePath = (basePath: string, pathname: string) => {
  if (!basePath || basePath === '/') {
    return pathname;
  }
  if (pathname === '/') {
    return basePath;
  }
  return `${basePath}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
};

export default function NotesMarketplacePage({ basePath = '' }: NotesMarketplacePageProps) {
  const t = useTranslations('notePublic');
  const format = useFormatter();
  const locale = useLocale();
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
          locale,
        });
        setNotes(response.data?.data ?? []);
        setLoading('idle');
      } catch (err: unknown) {
        setError(t('loadError'));
        setLoading('error');
      }
    };

    fetchNotes();
  }, [debouncedSearch, categoryFilter, t, locale]);

  const filteredNotes = useMemo(() => {
    const base = categoryFilter === 'all'
      ? notes
      : notes.filter((note) => Array.isArray(note.categories) && note.categories.includes(categoryFilter));
    if (filter === 'all') return base;
    return base.filter((note) => (filter === 'paid' ? note.is_paid : !note.is_paid));
  }, [notes, filter, categoryFilter]);

  const toLocaleNumber = (value: number) => format.number(value);

  return (
    <DashboardLayout
      pageTitle={t('pageTitle')}
      pageSubtitle={t('pageSubtitle')}
      requireAuth={false}
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-6 sm:px-6 sm:gap-12">
        <section className="border border-slate-200 bg-white/80 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {([
                { value: 'all', label: t('filters.all') },
                { value: 'free', label: t('filters.free') },
                { value: 'paid', label: t('filters.paid') },
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
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:w-72">
                <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="h-8 w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <LanguageSwitcher />
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
                {t('allCategoriesLabel')}
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
                  #{t(`categories.${option.value}`)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading === 'loading' ? (
          <div className="flex h-60 items-center justify-center text-sm text-slate-500">
            <SpinIndicator /> {t('loading')}
          </div>
        ) : loading === 'error' ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error ?? t('loadError')}
          </div>
        ) : filteredNotes.length === 0 ? (
          <section className="border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{t('emptyTitle')}</h2>
            <p className="mt-3 text-sm text-slate-600">{t('emptyDescription')}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              {t('emptyBadge')}
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredNotes.map((note) => {
              const primaryCategory = note.categories?.[0];
              const categoryLabel = primaryCategory ? t(`categories.${primaryCategory}`) : null;
              const dateLabel = note.published_at
                ? format.dateTime(new Date(note.published_at), { month: 'short', day: 'numeric' })
                : t('unpublishedLabel');
              const priceLabel = note.is_paid
                ? note.allow_point_purchase
                  ? `${toLocaleNumber(note.price_points)} pt`
                  : note.allow_jpy_purchase && note.price_jpy
                    ? `¥${toLocaleNumber(note.price_jpy)}`
                    : t('paidBadge')
                : t('freeBadge');

              return (
                <Link
                  key={note.id}
                  href={withBasePath(basePath, `/notes/${note.slug}`)}
                  className="group flex items-center gap-3 border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0 hover:border-blue-300 hover:shadow-md md:flex-col md:items-stretch md:overflow-hidden md:gap-0 md:p-0"
                >
                  <div className="relative h-20 w-24 flex-none overflow-hidden bg-slate-100 md:h-auto md:w-full md:aspect-[3/2]">
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
                  <div className="flex flex-1 flex-col justify-between gap-2 py-1 md:px-4 md:py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 md:text-xs">
                        {note.is_featured ? (
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white md:text-[11px]">
                            {t('featuredBadge')}
                          </span>
                        ) : null}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide md:text-[11px] ${
                            note.is_paid
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {priceLabel}
                        </span>
                        {categoryLabel ? <span>#{categoryLabel}</span> : null}
                        <span>{dateLabel}</span>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 md:text-base">
                        {note.title}
                      </h3>
                      {note.excerpt ? (
                        <p className="line-clamp-2 text-xs text-slate-500 md:text-sm">{note.excerpt}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 md:text-xs">
                      <span>@{note.author_username ?? 'unknown'}</span>
                      {note.total_sales ? (
                        <span>{t('views', { count: note.total_sales })}</span>
                      ) : null}
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
  return (
    <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-60"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function DefaultCover() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-semibold text-slate-500">
      NOTE
    </div>
  );
}
