'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowPathIcon,
  DocumentPlusIcon,
  EyeIcon,
  PencilSquareIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';
import { noteApi } from '@/lib/api';
import { loadCache, saveCache } from '@/lib/cache';
import type { NoteSummary } from '@/types';
import { getCategoryLabel } from '@/lib/noteCategories';

type FilterValue = 'all' | 'draft' | 'published';

interface NoteShareStats {
  total_shares: number;
  total_reward_points: number;
  verified_shares: number;
  suspicious_shares: number;
}

const NOTE_LIST_CACHE_TTL = 120_000; // 2 minutes
const NOTE_SHARE_CACHE_TTL = 300_000; // 5 minutes

export default function NoteDashboardPage() {
  const { user, isAuthenticated, isInitialized, token } = useAuthStore();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareStats, setShareStats] = useState<Record<string, NoteShareStats>>({});
  const didHydrateFromCacheRef = useRef(false);

  const cacheKeyForFilter = useCallback((filterValue: FilterValue) => `note-dashboard-${filterValue}`, []);

  const hydrateFromCache = useCallback((filterValue: FilterValue) => {
    if (didHydrateFromCacheRef.current) return;
    const cached = loadCache<{ notes: NoteSummary[] }>(cacheKeyForFilter(filterValue), NOTE_LIST_CACHE_TTL);
    if (cached && Array.isArray(cached.notes)) {
      setNotes(cached.notes);
      const cachedStats: Record<string, NoteShareStats> = {};
      for (const note of cached.notes) {
        const stat = loadCache<NoteShareStats>(`note-share-${note.id}`, NOTE_SHARE_CACHE_TTL);
        if (stat) {
          cachedStats[note.id] = stat;
        }
      }
      if (Object.keys(cachedStats).length > 0) {
        setShareStats(cachedStats);
      }
      setLoading(false);
      didHydrateFromCacheRef.current = true;
    }
  }, [cacheKeyForFilter]);

  const fetchShareStats = useCallback(async (noteList: NoteSummary[]) => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
    const stats: Record<string, NoteShareStats> = {};

    const pending: Array<Promise<void>> = [];

    for (const note of noteList) {
      const cacheKey = `note-share-${note.id}`;
      const cached = loadCache<NoteShareStats>(cacheKey, NOTE_SHARE_CACHE_TTL);
      if (cached) {
        stats[note.id] = cached;
        continue;
      }

      pending.push(
        (async () => {
          try {
            const response = await fetch(`${apiUrl}/notes/${note.id}/share-stats`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const payload = (await response.json()) as NoteShareStats;
              stats[note.id] = payload;
              saveCache(cacheKey, payload);
            }
          } catch (error) {
            console.error(`Failed to fetch share stats for note ${note.id}:`, error);
          }
        })()
      );
    }

    if (pending.length > 0) {
      await Promise.all(pending);
    }

    if (Object.keys(stats).length > 0) {
      setShareStats((prev) => ({ ...prev, ...stats }));
    }
  }, [token]);

  const fetchNotes = useCallback(
    async (status: FilterValue, options?: { showSpinner?: boolean }) => {
      if (!isAuthenticated) return;
      setError(null);
      const showSpinner = options?.showSpinner ?? true;
      if (showSpinner) {
        setLoading(true);
      }
      try {
        const params: { status_filter?: 'draft' | 'published'; limit: number; offset: number } = {
          limit: 100,
          offset: 0,
        };
        if (status !== 'all') {
          params.status_filter = status;
        }
        const response = await noteApi.list(params);
        const fetchedNotes = response.data?.data ?? [];
        setNotes(fetchedNotes);
        saveCache(cacheKeyForFilter(status), { notes: fetchedNotes });

        // 各NOTEのシェア統計を取得（非同期で更新）
        void fetchShareStats(fetchedNotes);
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Swipeコラム一覧の取得に失敗しました');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [cacheKeyForFilter, fetchShareStats, isAuthenticated]
  );

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    didHydrateFromCacheRef.current = false;
    hydrateFromCache(filter);
    const showSpinner = !didHydrateFromCacheRef.current;
    fetchNotes(filter, { showSpinner });
  }, [fetchNotes, filter, hydrateFromCache, isInitialized, isAuthenticated]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    didHydrateFromCacheRef.current = false;
    fetchNotes(filter, { showSpinner: true });
  };

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const keyword = search.trim().toLowerCase();
    return notes.filter((note) =>
      [note.title, note.excerpt, note.slug].some((field) =>
        field ? field.toLowerCase().includes(keyword) : false
      )
    );
  }, [notes, search]);

  const stats = useMemo(() => {
    const total = notes.length;
    const published = notes.filter((note) => note.status === 'published').length;
    const draft = notes.filter((note) => note.status === 'draft').length;
    const paid = notes.filter((note) => note.is_paid).length;
    return { total, published, draft, paid };
  }, [notes]);

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const lastUpdatedAt = notes.length
    ? new Date(notes[0].updated_at).toLocaleString('ja-JP')
    : '—';

  return (
    <DashboardLayout
      pageTitle="コラム編集"
      pageSubtitle="作成したSwipeコラムを管理・公開できます"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">最終更新: {lastUpdatedAt}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className={`inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 ${
                isRefreshing ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              更新
            </button>
            <Link
              href="/note/create"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <DocumentPlusIcon className="h-4 w-4" aria-hidden="true" />
              新規コラム作成
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">全記事</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">公開中</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.published}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">下書き</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.draft}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">有料記事</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{stats.paid}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'draft', 'published'] as FilterValue[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {value === 'all' ? 'すべて' : value === 'draft' ? '下書き' : '公開中'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="タイトル・概要で検索"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-52 items-center justify-center text-sm text-slate-500">読み込み中...</div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              <p>該当するSwipeコラムがありません。</p>
              <Link
                href="/note/create"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <DocumentPlusIcon className="h-4 w-4" aria-hidden="true" />
                新規コラム作成
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredNotes.map((note) => {
                const isPublished = note.status === 'published';
                return (
                  <div
                    key={note.id}
                    className="border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                              isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isPublished ? '公開中' : '下書き'}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              note.visibility === 'public'
                                ? 'bg-blue-100 text-blue-700'
                                : note.visibility === 'limited'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {note.visibility === 'public'
                              ? '一般公開'
                              : note.visibility === 'limited'
                                ? '限定公開'
                                : '非公開'}
                          </span>
                          {note.requires_login ? (
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                              ログイン必須
                            </span>
                          ) : null}
                          {note.is_paid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              <LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />有料
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              <GlobeAltIcon className="h-3.5 w-3.5" aria-hidden="true" />無料
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{note.title}</h3>
                        {note.excerpt ? (
                          <p className="text-sm text-slate-600 line-clamp-2">{note.excerpt}</p>
                        ) : null}
                        {Array.isArray(note.categories) && note.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {note.categories.map((category) => (
                              <span
                                key={category}
                                className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                              >
                                #{getCategoryLabel(category)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>更新: {new Date(note.updated_at).toLocaleString('ja-JP')}</span>
                          {isPublished && note.published_at ? (
                            <span>公開: {new Date(note.published_at).toLocaleString('ja-JP')}</span>
                          ) : null}
                          {note.is_paid ? <span>{note.price_points.toLocaleString()} P</span> : <span>無料公開</span>}
                          <span>スラッグ: {note.slug}</span>
                        </div>
                        {note.visibility === 'limited' ? (
                          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">限定公開URL:</span>
                            {note.share_url ? (
                              <a
                                href={note.share_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
                              >
                                {note.share_url}
                              </a>
                            ) : (
                              <span className="break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                                編集画面で保存するとURLが生成されます
                              </span>
                            )}
                          </div>
                        ) : null}
                        
                        {/* シェア統計 */}
                        {shareStats[note.id] && shareStats[note.id].total_shares > 0 ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                            <span className="text-xs font-semibold text-blue-900">
                              💰 {shareStats[note.id].total_shares}回シェア → {shareStats[note.id].total_reward_points}P獲得
                            </span>
                            {shareStats[note.id].suspicious_shares > 0 ? (
                              <span className="text-xs font-semibold text-amber-700">
                                ⚠️ 不正疑い: {shareStats[note.id].suspicious_shares}件
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/note/${note.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                          編集
                        </Link>
                        {isPublished && note.visibility !== 'limited' ? (
                          <Link
                            href={`/notes/${note.slug}`}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                            公開ページ
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
