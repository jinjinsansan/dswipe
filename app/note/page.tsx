'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
import DSwipeLogo from '@/components/DSwipeLogo';
import {
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import DashboardMobileNav from '@/components/dashboard/DashboardMobileNav';
import { noteApi } from '@/lib/api';
import type { NoteSummary } from '@/types';
import { getCategoryLabel } from '@/lib/noteCategories';

type FilterValue = 'all' | 'draft' | 'published';

export default function NoteDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();

  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  const navLinks = useMemo(
    () => getDashboardNavLinks({ isAdmin, userType: user?.user_type }),
    [isAdmin, user?.user_type]
  );
  const navGroups = useMemo(() => groupDashboardNavLinks(navLinks), [navLinks]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const fetchNotes = useCallback(
    async (status: FilterValue) => {
      if (!isAuthenticated) return;
      setError(null);
      setLoading(true);
      try {
        const params: { status_filter?: 'draft' | 'published'; limit: number; offset: number } = {
          limit: 100,
          offset: 0,
        };
        if (status !== 'all') {
          params.status_filter = status;
        }
        const response = await noteApi.list(params);
        setNotes(response.data?.data ?? []);
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'NOTE一覧の取得に失敗しました');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    fetchNotes(filter);
  }, [fetchNotes, filter, isInitialized, isAuthenticated]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotes(filter);
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

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden sm:flex w-52 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 h-16 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="flex flex-col gap-4">
            {navGroups.map((group) => {
              const meta = getDashboardNavGroupMeta(group.key);
              return (
                <div key={group.key} className="space-y-1.5">
                  <p className={`px-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.headingClass}`}>
                    {meta.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((link) => {
                      const isActive = isDashboardLinkActive(pathname, link.href);
                      const linkProps = link.external
                        ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
                        : { href: link.href };
                      const styles = getDashboardNavClasses(link, { variant: 'desktop', active: isActive });

                      return (
                        <Link
                          key={link.href}
                          {...linkProps}
                          className={`flex items-center justify-between gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${styles.container}`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className={`flex h-5 w-5 items-center justify-center ${styles.icon}`}>
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </span>
                          {link.badge ? (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 text-sm font-medium truncate">{user?.username}</div>
              <div className="text-slate-500 text-xs capitalize">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
          <div className="hidden sm:block flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0.5">NOTE編集</h1>
            <p className="text-slate-500 text-[11px] sm:text-xs font-medium truncate">作成したNOTE記事を管理・公開できます</p>
          </div>
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
              新規NOTE作成
            </Link>
          </div>
        </div>

        <div className="sm:hidden border-b border-slate-200 bg-white/90">
          <DashboardMobileNav navGroups={navGroups} pathname={pathname} />
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">全記事</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">公開中</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.published}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">下書き</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.draft}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">有料記事</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">{stats.paid}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
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
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  <p>該当するNOTE記事がありません。</p>
                  <Link
                    href="/note/create"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <DocumentPlusIcon className="h-4 w-4" aria-hidden="true" />
                    新規NOTE作成
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredNotes.map((note) => {
                    const isPublished = note.status === 'published';
                    return (
                      <div
                        key={note.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                  isPublished
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {isPublished ? '公開中' : '下書き'}
                              </span>
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
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/note/${note.id}/edit`}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                            >
                              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                              編集
                            </Link>
                            {isPublished ? (
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
        </div>
      </main>
    </div>
  );
}
