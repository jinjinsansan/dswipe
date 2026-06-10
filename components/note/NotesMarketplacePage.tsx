'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useFormatter, useTranslations, useLocale } from 'next-intl';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { fetchPublicNotes } from '@/lib/publicClient';
import { NOTE_CATEGORY_OPTIONS } from '@/lib/noteCategories';
import type { PublicNoteSummary } from '@/types';
import { GRAD_BRAND, HEAD_BG, NAVY_CARD_BG, pickAvatarGradient, pickThumbFallback } from '@/lib/momentum';

/* Momentum note list — mock: design_handoff_dswipe/D-Swipe Note List.html */

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
        const response = await fetchPublicNotes({
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          categories: categoryFilter !== 'all' ? [categoryFilter] : undefined,
          locale,
        });
        const payload = response?.data ?? response;
        const items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
          ? payload
          : [];
        setNotes(items as PublicNoteSummary[]);
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

  const popularNotes = useMemo(
    () =>
      [...notes]
        .filter((note) => Number(note.total_sales) > 0)
        .sort((a, b) => (Number(b.total_sales) || 0) - (Number(a.total_sales) || 0))
        .slice(0, 3),
    [notes],
  );

  const toLocaleNumber = (value: number) => format.number(value);

  const renderPrice = (note: PublicNoteSummary) => {
    if (!note.is_paid) {
      return <span className="ml-auto text-[13px] font-extrabold text-green-700">{t('freeBadge')}</span>;
    }
    const label = note.allow_point_purchase
      ? `${toLocaleNumber(note.price_points)} P`
      : note.allow_jpy_purchase && note.price_jpy
        ? `¥${toLocaleNumber(note.price_jpy)}`
        : t('paidBadge');
    return <span className="ml-auto text-[13px] font-extrabold text-sky-600 tabular-nums">{label}</span>;
  };

  return (
    <DashboardLayout
      pageTitle={t('pageTitle')}
      pageSubtitle={t('pageSubtitle')}
      requireAuth={false}
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
        {/* Navy hero */}
        <div className="rounded-3xl px-6 py-7 sm:px-9 sm:py-9 mb-7 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]" style={{ background: HEAD_BG }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-[.16em] uppercase text-cyan-300">Notes</div>
              <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-pure-white mt-2">{t('pageTitle')}</h1>
              <p className="text-sm text-[#bcd3ee] mt-2">{t('pageSubtitle')}</p>
            </div>
            <span className="rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
              <LanguageSwitcher />
            </span>
          </div>
          <div className="relative max-w-[560px] mt-5">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-[19px] h-[19px] text-slate-500" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-[15px] text-slate-900 placeholder-slate-400 bg-white border-0 rounded-[14px] py-3.5 pl-[46px] pr-4 shadow-lg focus:outline-none focus:ring-[3px] focus:ring-cyan-400/40"
            />
          </div>
          <div className="flex gap-2 mt-[18px] flex-wrap">
            {([
              { value: 'all', label: t('filters.all') },
              { value: 'free', label: t('filters.free') },
              { value: 'paid', label: t('filters.paid') },
            ] as Array<{ value: FilterValue; label: string }>).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`text-[13px] font-semibold rounded-full px-3.5 py-[7px] border transition-colors whitespace-nowrap ${
                  filter === option.value
                    ? 'bg-white text-[#0b1f3a] border-white'
                    : 'text-[#cfe3f5] bg-white/[0.08] border-white/[0.16] hover:bg-white/[0.16]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="-mx-2 mt-2.5">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto px-2 pb-1 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`shrink-0 whitespace-nowrap text-[12px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-white text-[#0b1f3a] border-white'
                    : 'text-[#cfe3f5] bg-white/[0.08] border-white/[0.16] hover:bg-white/[0.16]'
                }`}
              >
                {t('allCategoriesLabel')}
              </button>
              {NOTE_CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategoryFilter(option.value)}
                  className={`shrink-0 whitespace-nowrap text-[12px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                    categoryFilter === option.value
                      ? 'bg-white text-[#0b1f3a] border-white'
                      : 'text-[#cfe3f5] bg-white/[0.08] border-white/[0.16] hover:bg-white/[0.16]'
                  }`}
                >
                  #{t(`categories.${option.value}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
          <main>
            {loading === 'loading' ? (
              <div className="flex h-60 items-center justify-center gap-2 text-sm text-slate-500 bg-white border border-[#e2ebf6] rounded-2xl shadow-sm">
                <SpinIndicator /> {t('loading')}
              </div>
            ) : loading === 'error' ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {error ?? t('loadError')}
              </div>
            ) : filteredNotes.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-[#bfe6fb] bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-bold text-[#0b1f3a]">{t('emptyTitle')}</h2>
                <p className="mt-3 text-sm text-slate-600">{t('emptyDescription')}</p>
                <div
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)]"
                  style={{ background: GRAD_BRAND }}
                >
                  <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                  {t('emptyBadge')}
                </div>
              </section>
            ) : (
              <section className="flex flex-col gap-4">
                {filteredNotes.map((note) => {
                  const primaryCategory = note.categories?.[0];
                  const categoryLabel = primaryCategory ? t(`categories.${primaryCategory}`) : null;
                  const dateLabel = note.published_at
                    ? format.dateTime(new Date(note.published_at), { month: 'short', day: 'numeric' })
                    : t('unpublishedLabel');
                  const author = note.author_username ?? 'unknown';
                  const fallbackBg = pickThumbFallback(String(note.id ?? note.title ?? ""));
                  const avatarBg = pickAvatarGradient(author);

                  return (
                    <Link
                      key={note.id}
                      href={withBasePath(basePath, `/notes/${note.slug}`)}
                      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-[#e2ebf6] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#bfe6fb] hover:shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]"
                    >
                      <div className="relative h-[150px] sm:h-auto sm:w-[168px] flex-shrink-0 overflow-hidden" style={{ background: fallbackBg }}>
                        {note.cover_image_url ? (
                          <Image
                            src={note.cover_image_url}
                            alt={note.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-[18px]">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {categoryLabel ? (
                            <span className="text-[11px] font-bold text-sky-600 bg-[#e9f6fe] border border-[#bfe6fb] rounded-full px-2.5 py-[3px]">
                              {categoryLabel}
                            </span>
                          ) : null}
                          {note.is_featured ? (
                            <span className="text-[10px] font-extrabold text-pure-white rounded-full px-2.5 py-[3px]" style={{ background: GRAD_BRAND }}>
                              {t('featuredBadge')}
                            </span>
                          ) : null}
                          {note.requires_login ? (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-[3px]">
                              {t('loginRequiredBadge')}
                            </span>
                          ) : null}
                          <span className="text-[11px] text-slate-400">{dateLabel}</span>
                        </div>
                        <h3 className="text-[15px] sm:text-[17px] font-extrabold tracking-tight text-[#0b1f3a] leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
                          {note.title}
                        </h3>
                        {note.excerpt ? (
                          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 line-clamp-2">{note.excerpt}</p>
                        ) : null}
                        <div className="mt-auto flex items-center gap-2.5 pt-3 text-xs text-slate-500">
                          <span
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-extrabold text-[#042032] flex-shrink-0"
                            style={{ background: avatarBg }}
                          >
                            {author.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">@{author}</span>
                          {note.total_sales ? <span className="whitespace-nowrap">{t('views', { count: note.total_sales })}</span> : null}
                          {renderPrice(note)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            {popularNotes.length > 0 && (
              <div className="bg-white border border-[#e2ebf6] rounded-2xl p-[18px] shadow-sm mb-4">
                <h4 className="text-[13px] font-bold text-[#0b1f3a] mb-3">{t('popularTitle')}</h4>
                {popularNotes.map((note, i) => (
                  <Link
                    key={note.id}
                    href={withBasePath(basePath, `/notes/${note.slug}`)}
                    className={`flex gap-[11px] py-2 items-start group ${i > 0 ? 'border-t border-[#eef3f9]' : ''}`}
                  >
                    <span className="w-[18px] flex-shrink-0 text-[15px] font-extrabold text-sky-600 tabular-nums">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold text-[#0b1f3a] leading-normal line-clamp-2 group-hover:text-sky-600 transition-colors">
                        {note.title}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        @{note.author_username ?? 'unknown'} · {toLocaleNumber(Number(note.total_sales) || 0)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-5 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]" style={{ background: NAVY_CARD_BG }}>
              <b className="block text-[15px] font-extrabold text-pure-white">{t('ctaTitle')}</b>
              <p className="text-[12.5px] text-[#bcd3ee] mt-2 mb-4 leading-relaxed">{t('ctaBody')}</p>
              <Link
                href="/note/create"
                className="inline-flex items-center justify-center gap-2 w-full text-[13px] font-bold text-pure-white rounded-xl px-4 py-2.5 shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)] transition-shadow"
                style={{ background: GRAD_BRAND }}
              >
                {t('ctaButton')}
                <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
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
