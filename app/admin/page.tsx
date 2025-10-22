'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import DSwipeLogo from '@/components/DSwipeLogo';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type {
  AdminMarketplaceLP,
  AdminPointAnalytics,
  AdminPointAnalyticsBreakdown,
  AdminUserDetail,
  AdminUserSummary,
  AdminAnnouncement,
  ModerationEvent,
} from '@/types';

type TabMeta = {
  id: 'users' | 'marketplace' | 'analytics' | 'announcements' | 'logs';
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const TABS: TabMeta[] = [
  { id: 'users', label: 'ユーザー管理', icon: UserGroupIcon },
  { id: 'marketplace', label: 'マーケット監視', icon: BuildingStorefrontIcon },
  { id: 'analytics', label: 'ポイント分析', icon: ChartBarIcon },
  { id: 'announcements', label: 'お知らせ管理', icon: MegaphoneIcon },
  { id: 'logs', label: 'モデレーションログ', icon: DocumentTextIcon },
];

type TabKey = TabMeta['id'];

const formatNumber = (value: number) => new Intl.NumberFormat('ja-JP').format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? '-';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatPoints = (value: number) => `${formatNumber(value)} P`;

type ApiErrorResponse = {
  detail?: string;
};

type AdminUserListApiResponse = {
  data?: AdminUserSummary[];
  total?: number;
};

type AdminUserDetailApiResponse = AdminUserDetail;

type AdminMarketplaceApiResponse = {
  data?: AdminMarketplaceLP[];
  total?: number;
};

type AdminPointAnalyticsApiResponse = AdminPointAnalytics | null;

type ModerationLogApiResponse = {
  data?: ModerationEvent[];
};

type AdminAnnouncementsApiResponse = {
  data?: AdminAnnouncement[];
  total?: number;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? fallback;
  }
  return fallback;
};

const defaultAnnouncementPublishedAt = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [pageLoading, setPageLoading] = useState(true);

  const [userSummaries, setUserSummaries] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [grantAmount, setGrantAmount] = useState<number>(1000);
  const [grantDescription, setGrantDescription] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const [marketplaceItems, setMarketplaceItems] = useState<AdminMarketplaceLP[]>([]);
  const [marketSearch, setMarketSearch] = useState('');
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<AdminPointAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [logs, setLogs] = useState<ModerationEvent[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementSummary, setAnnouncementSummary] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPublishedAt, setAnnouncementPublishedAt] = useState(defaultAnnouncementPublishedAt());
  const [announcementPublished, setAnnouncementPublished] = useState(true);
  const [announcementHighlight, setAnnouncementHighlight] = useState(false);

  const [usersError, setUsersError] = useState<string | null>(null);
  const [userActionError, setUserActionError] = useState<string | null>(null);

  const resetAnnouncementForm = () => {
    setEditingAnnouncementId(null);
    setAnnouncementTitle('');
    setAnnouncementSummary('');
    setAnnouncementBody('');
    setAnnouncementPublishedAt(defaultAnnouncementPublishedAt());
    setAnnouncementPublished(true);
    setAnnouncementHighlight(false);
    setAnnouncementsError(null);
  };


  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    const load = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchMarketplace(),
          fetchAnalytics(),
          fetchLogs(),
          fetchAnnouncements(),
        ]);
      } finally {
        setPageLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated, isAdmin]);

  const fetchUsers = async (search?: string) => {
    setUsersLoading(true);
    try {
      const response = await adminApi.listUsers({ search, limit: 100 });
      const payload = response.data as AdminUserListApiResponse;
      const summaries = Array.isArray(payload.data) ? payload.data : [];
      setUserSummaries(summaries);
      setUsersError(null);

      if (selectedUserId) {
        const matched = summaries.find((item) => item.id === selectedUserId);
        if (matched) {
          setSelectedUserDetail((prev) => (prev ? { ...prev, ...matched } : prev));
        }
      }
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザー情報の取得に失敗しました');
      console.error(error);
      setUsersError(message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setUserDetailLoading(true);
    try {
      const response = await adminApi.getUserDetail(userId);
      setSelectedUserDetail(response.data as AdminUserDetailApiResponse);
      setUserActionError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザー詳細の取得に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const fetchMarketplace = async (search?: string) => {
    setMarketLoading(true);
    try {
      const response = await adminApi.listMarketplaceLPs({ search, limit: 100 });
      const payload = response.data as AdminMarketplaceApiResponse;
      const items = Array.isArray(payload.data) ? payload.data : [];
      setMarketplaceItems(items);
      setMarketError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'マーケット情報の取得に失敗しました');
      console.error(error);
      setMarketError(message);
    } finally {
      setMarketLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await adminApi.getPointAnalytics({ limit_days: 120 });
      setAnalytics((response.data as AdminPointAnalyticsApiResponse) ?? null);
      setAnalyticsError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'ポイント分析の取得に失敗しました');
      console.error(error);
      setAnalyticsError(message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await adminApi.getModerationLogs({ limit: 100 });
      const payload = response.data as ModerationLogApiResponse;
      const rows = Array.isArray(payload.data) ? payload.data : [];
      setLogs(rows);
      setLogsError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'モデレーションログの取得に失敗しました');
      console.error(error);
      setLogsError(message);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const response = await adminApi.listAnnouncements({ limit: 50 });
      const payload = response.data as AdminAnnouncementsApiResponse;
      const rows = Array.isArray(payload.data) ? payload.data : [];
      setAnnouncements(rows);
      setAnnouncementsError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'お知らせの取得に失敗しました');
      console.error(error);
      setAnnouncementsError(message);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const populateAnnouncementForm = (item: AdminAnnouncement) => {
    setEditingAnnouncementId(item.id);
    setAnnouncementTitle(item.title);
    setAnnouncementSummary(item.summary);
    setAnnouncementBody(item.body);
    const publishedAt = new Date(item.published_at);
    if (!Number.isNaN(publishedAt.getTime())) {
      const local = new Date(publishedAt.getTime() - publishedAt.getTimezoneOffset() * 60000);
      setAnnouncementPublishedAt(local.toISOString().slice(0, 16));
    } else {
      setAnnouncementPublishedAt(defaultAnnouncementPublishedAt());
    }
    setAnnouncementPublished(item.is_published);
    setAnnouncementHighlight(item.highlight);
    setAnnouncementsError(null);
  };

  const handleAnnouncementSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!announcementTitle.trim() || !announcementSummary.trim() || !announcementBody.trim()) {
      setAnnouncementsError('タイトル・サマリー・本文は必須です');
      return;
    }
    setAnnouncementSaving(true);
    try {
      const payload = {
        title: announcementTitle.trim(),
        summary: announcementSummary.trim(),
        body: announcementBody,
        published_at: announcementPublishedAt ? new Date(announcementPublishedAt).toISOString() : undefined,
        is_published: announcementPublished,
        highlight: announcementHighlight,
      };
      if (editingAnnouncementId) {
        await adminApi.updateAnnouncement(editingAnnouncementId, payload);
      } else {
        await adminApi.createAnnouncement(payload);
      }
      await fetchAnnouncements();
      resetAnnouncementForm();
      setAnnouncementsError(null);
    } catch (error) {
      const message = getErrorMessage(error, editingAnnouncementId ? 'お知らせの更新に失敗しました' : 'お知らせの作成に失敗しました');
      console.error(error);
      setAnnouncementsError(message);
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleAnnouncementEdit = (item: AdminAnnouncement) => {
    populateAnnouncementForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnnouncementDelete = async (announcementId: string) => {
    const target = announcements.find((item) => item.id === announcementId);
    const confirmed = window.confirm(`${target?.title ?? 'お知らせ'}を削除しますか？`);
    if (!confirmed) return;
    setAnnouncementSaving(true);
    try {
      await adminApi.deleteAnnouncement(announcementId);
      if (editingAnnouncementId === announcementId) {
        resetAnnouncementForm();
      }
      await fetchAnnouncements();
    } catch (error) {
      const message = getErrorMessage(error, 'お知らせの削除に失敗しました');
      console.error(error);
      setAnnouncementsError(message);
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    fetchUserDetail(userId);
  };

  const handleGrantPoints = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) return;
    if (grantAmount === 0) {
      alert('付与ポイント数を入力してください');
      return;
    }

    setUserActionLoading(true);
    try {
      await adminApi.grantPoints({
        user_id: selectedUserId,
        amount: grantAmount,
        description: grantDescription || undefined,
      });
      setUserActionError(null);
      await Promise.all([fetchUsers(userSearch), fetchUserDetail(selectedUserId)]);
      setGrantAmount(1000);
      setGrantDescription('');
    } catch (error) {
      const message = getErrorMessage(error, 'ポイント付与に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUserId) return;
    setUserActionLoading(true);
    try {
      await adminApi.blockUser(selectedUserId, { reason: blockReason || undefined });
      setUserActionError(null);
      await Promise.all([fetchUsers(userSearch), fetchUserDetail(selectedUserId)]);
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザーブロックに失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUserId) return;
    setUserActionLoading(true);
    try {
      await adminApi.unblockUser(selectedUserId);
      setUserActionError(null);
      setBlockReason('');
      await Promise.all([fetchUsers(userSearch), fetchUserDetail(selectedUserId)]);
    } catch (error) {
      const message = getErrorMessage(error, 'ブロック解除に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId || !selectedUserDetail) return;
    const confirmed = window.confirm(`${selectedUserDetail.username} を削除しますか？この操作は取り消せません。`);
    if (!confirmed) return;

    setUserActionLoading(true);
    try {
      await adminApi.deleteUser(selectedUserId);
      setUserActionError(null);
      setSelectedUserId(null);
      setSelectedUserDetail(null);
      await fetchUsers(userSearch);
    } catch (error) {
      const message = getErrorMessage(error, 'ユーザー削除に失敗しました');
      console.error(error);
      setUserActionError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUpdateLPStatus = async (lpId: string, status: 'published' | 'archived') => {
    let reason: string | undefined;
    if (status === 'archived') {
      reason = window.prompt('非公開理由を入力してください') || undefined;
    }

    setMarketLoading(true);
    try {
      await adminApi.updateLPStatus(lpId, { status, reason });
      await fetchMarketplace(marketSearch);
      setMarketError(null);
    } catch (error) {
      const message = getErrorMessage(error, 'LPステータスの更新に失敗しました');
      console.error(error);
      setMarketError(message);
    } finally {
      setMarketLoading(false);
    }
  };

  const totals = analytics?.totals;

  const topDailyBreakdown = useMemo<AdminPointAnalyticsBreakdown[]>(() => {
    if (!analytics) return [];
    return analytics.daily.slice(0, 14);
  }, [analytics]);

  if (!isInitialized || pageLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">管理者パネルを読み込んでいます...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <DSwipeLogo size="medium" showFullName />
              <span className="text-xs font-semibold tracking-[0.35em] text-red-400 uppercase">ADMIN</span>
            </Link>
            <nav className="hidden md:block">
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/40 px-2 py-1 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.9)]">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.8)]'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-white text-sm font-semibold">{user?.username}</span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-600/15 text-red-300 hover:bg-red-600/25 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
        <div className="md:hidden border-t border-slate-800 px-3 py-3 flex items-center gap-2 overflow-x-auto bg-slate-900/80">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {activeTab === 'users' && (
            <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6 xl:gap-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.9)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">ユーザー一覧</h2>
                    <p className="text-xs text-slate-400 mt-1">検索・フィルタで対象ユーザーを絞り込み、詳細操作を行えます。</p>
                  </div>
                  <button
                    onClick={() => fetchUsers(userSearch)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-slate-800 hover:bg-slate-800"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    更新
                  </button>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    fetchUsers(userSearch);
                  }}
                  className="flex flex-col sm:flex-row gap-3 mb-4"
                >
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="ユーザー名・メールアドレスで検索"
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      検索
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserSearch('');
                        fetchUsers();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      リセット
                    </button>
                  </div>
                </form>

                {usersError && (
                  <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {usersError}
                  </div>
                )}

                <div className="hidden xl:block border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-900/60 grid grid-cols-6 gap-3 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <span>ユーザー</span>
                    <span className="col-span-2">メール</span>
                    <span>ポイント</span>
                    <span>LP</span>
                    <span>ステータス</span>
                  </div>
                  <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-800/60">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                        読み込み中...
                      </div>
                    ) : userSummaries.length === 0 ? (
                      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                        ユーザーが見つかりません
                      </div>
                    ) : (
                      userSummaries.map((summary) => {
                        const isSelected = summary.id === selectedUserId;
                        return (
                          <button
                            key={summary.id}
                            onClick={() => handleSelectUser(summary.id)}
                            className={`grid grid-cols-6 gap-3 px-4 py-3 text-left transition-colors ${
                              isSelected ? 'bg-blue-600/20 text-white' : 'hover:bg-slate-900/70 text-slate-200'
                            }`}
                          >
                            <div className="truncate text-sm font-semibold">{summary.username}</div>
                            <div className="col-span-2 truncate text-xs text-slate-400">{summary.email}</div>
                            <div className="text-sm font-semibold text-slate-100">{formatNumber(summary.point_balance)}</div>
                            <div className="text-xs text-slate-300">{summary.total_lp_count} 件</div>
                            <div className="text-xs">
                              {summary.is_blocked ? (
                                <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-red-200">BLOCKED</span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200">ACTIVE</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="xl:hidden space-y-3">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-10 text-slate-400 text-sm">読み込み中...</div>
                  ) : userSummaries.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-slate-400 text-sm">ユーザーが見つかりません</div>
                  ) : (
                    userSummaries.map((summary) => {
                      const isSelected = summary.id === selectedUserId;
                      return (
                        <button
                          key={summary.id}
                          onClick={() => handleSelectUser(summary.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'border-blue-500/70 bg-blue-500/15 text-white'
                              : 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-white">{summary.username}</div>
                              <div className="text-xs text-slate-400 break-all">{summary.email}</div>
                            </div>
                            <div className="text-right text-xs text-slate-300">
                              <div>{formatNumber(summary.point_balance)} P</div>
                              <div>{summary.total_lp_count} LP</div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-400">ユーザー種別: {summary.user_type}</span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                                summary.is_blocked ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/15 text-emerald-200'
                              }`}
                            >
                              {summary.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="xl:hidden">
                  {userDetailLoading ? (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center text-slate-300">
                      詳細を読み込み中...
                    </div>
                  ) : !selectedUserDetail ? (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center text-slate-400 text-sm">
                      ユーザーを選択すると詳細が表示されます
                    </div>
                  ) : (
                    <div className="mt-4 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-white">{selectedUserDetail.username}</h2>
                        <p className="text-xs text-slate-400 break-all">{selectedUserDetail.email}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                          <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5">{selectedUserDetail.user_type}</span>
                          <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5">登録日: {formatDateTime(selectedUserDetail.created_at)}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                              selectedUserDetail.is_blocked ? 'bg-red-600/30 text-red-100' : 'bg-emerald-500/15 text-emerald-200'
                            }`}
                          >
                            {selectedUserDetail.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                          <p className="text-[11px] text-slate-400">ポイント残高</p>
                          <p className="text-xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.point_balance)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                          <p className="text-[11px] text-slate-400">総購入ポイント</p>
                          <p className="text-xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.total_point_purchased)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                          <p className="text-[11px] text-slate-400">マーケット利用ポイント</p>
                          <p className="text-xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.total_point_spent)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                          <p className="text-[11px] text-slate-400">管理者付与累計</p>
                          <p className="text-xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.total_point_granted)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-semibold">ブロック制御</span>
                          <span className="text-slate-400">
                            {selectedUserDetail.blocked_at ? `最終更新: ${formatDateTime(selectedUserDetail.blocked_at)}` : '未ブロック'}
                          </span>
                        </div>
                        {selectedUserDetail.blocked_reason && (
                          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                            現在のブロック理由: {selectedUserDetail.blocked_reason}
                          </div>
                        )}
                        <textarea
                          value={blockReason}
                          onChange={(event) => setBlockReason(event.target.value)}
                          placeholder="ブロック理由 (任意)"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleBlockUser}
                            disabled={userActionLoading}
                            className="flex-1 rounded-xl bg-red-600 text-white text-sm font-semibold px-4 py-2 hover:bg-red-700 disabled:opacity-60"
                          >
                            ユーザーをブロック
                          </button>
                          <button
                            onClick={handleUnblockUser}
                            disabled={userActionLoading}
                            className="flex-1 rounded-xl bg-emerald-600/80 text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-600 disabled:opacity-60"
                          >
                            ブロック解除
                          </button>
                          <button
                            onClick={handleDeleteUser}
                            disabled={userActionLoading}
                            className="flex-1 rounded-xl border border-red-900/60 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-900/30 disabled:opacity-60"
                          >
                            ユーザー削除
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleGrantPoints} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">ポイント手動調整</h3>
                          <span className="text-xs text-slate-400">正数で付与、負数で減算</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="number"
                            value={grantAmount}
                            onChange={(event) => setGrantAmount(Number(event.target.value))}
                            className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={grantDescription}
                            onChange={(event) => setGrantDescription(event.target.value)}
                            placeholder="メモ (任意)"
                            className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={userActionLoading}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            実行
                          </button>
                        </div>
                      </form>

                      {userActionError && (
                        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                          {userActionError}
                        </div>
                      )}

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white">最新トランザクション</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.transactions.slice(0, 6).map((tx) => (
                            <div key={tx.id} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">{tx.transaction_type}</span>
                                <span className={tx.amount >= 0 ? 'text-emerald-200 font-semibold' : 'text-red-300 font-semibold'}>
                                  {formatPoints(tx.amount)}
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] text-slate-400">{formatDateTime(tx.created_at)}</div>
                              <div className="mt-1 text-[11px] text-slate-400 break-all">{tx.description || '-'}</div>
                            </div>
                          ))}
                          {selectedUserDetail.transactions.length === 0 && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-4 text-center text-xs text-slate-400">
                              トランザクションがありません
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white">LP 作成履歴</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.landing_pages.slice(0, 6).map((lp) => (
                            <div key={lp.id} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
                              <div className="text-white font-semibold">{lp.title}</div>
                              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                <span>ステータス: {lp.status}</span>
                                <span>ビュー: {formatNumber(lp.total_views)}</span>
                              </div>
                              <div className="mt-1 text-[11px] text-slate-400">CTA: {formatNumber(lp.total_cta_clicks)}</div>
                            </div>
                          ))}
                          {selectedUserDetail.landing_pages.length === 0 && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-4 text-center text-xs text-slate-400">
                              LP作成履歴がありません
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white">商品購入履歴</h3>
                        <div className="space-y-2">
                          {selectedUserDetail.purchase_history.slice(0, 6).map((purchase) => (
                            <div key={purchase.transaction_id} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
                              <div className="text-white font-semibold">{purchase.product_title || '-'}</div>
                              <div className="mt-1 text-[11px] text-slate-400 break-all">{purchase.description || '-'}</div>
                              <div className="mt-1 flex items-center justify-between text-[11px]">
                                <span className="text-red-300 font-semibold">{formatPoints(purchase.amount)}</span>
                                <span className="text-slate-400">{formatDateTime(purchase.created_at)}</span>
                              </div>
                            </div>
                          ))}
                          {selectedUserDetail.purchase_history.length === 0 && (
                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-4 text-center text-xs text-slate-400">
                              商品購入履歴がありません
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden xl:block rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
                {userDetailLoading ? (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    詳細を読み込み中...
                  </div>
                ) : !selectedUserDetail ? (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                    ユーザーを選択すると詳細が表示されます
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold text-white">{selectedUserDetail.username}</h2>
                      <p className="text-sm text-slate-400">{selectedUserDetail.email}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5">{selectedUserDetail.user_type}</span>
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5">登録日: {formatDateTime(selectedUserDetail.created_at)}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                            selectedUserDetail.is_blocked ? 'bg-red-600/30 text-red-100' : 'bg-emerald-500/15 text-emerald-200'
                          }`}
                        >
                          {selectedUserDetail.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                        <p className="text-xs text-slate-400">ポイント残高</p>
                        <p className="text-2xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.point_balance)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                        <p className="text-xs text-slate-400">総購入ポイント</p>
                        <p className="text-2xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.total_point_purchased)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                        <p className="text-xs text-slate-400">マーケット利用ポイント</p>
                        <p className="text-2xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.total_point_spent)}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                        <p className="text-xs text-slate-400">管理者付与累計</p>
                        <p className="text-2xl font-semibold text-white mt-1">{formatPoints(selectedUserDetail.total_point_granted)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">ブロック制御</h3>
                        <div className="text-xs text-slate-400">
                          {selectedUserDetail.blocked_at ? `最終更新: ${formatDateTime(selectedUserDetail.blocked_at)}` : '未ブロック'}
                        </div>
                      </div>
                      {selectedUserDetail.blocked_reason && (
                        <div className="text-xs text-red-200">
                          現在のブロック理由: {selectedUserDetail.blocked_reason}
                        </div>
                      )}
                      <textarea
                        value={blockReason}
                        onChange={(event) => setBlockReason(event.target.value)}
                        placeholder="ブロック理由 (任意)"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleBlockUser}
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                        >
                          ユーザーをブロック
                        </button>
                        <button
                          onClick={handleUnblockUser}
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-600/80 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60"
                        >
                          ブロック解除
                        </button>
                        <button
                          onClick={handleDeleteUser}
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-slate-900/80 text-red-200 text-sm font-semibold border border-red-900/60 hover:bg-red-900/30 disabled:opacity-60"
                        >
                          ユーザー削除
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleGrantPoints} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">ポイント手動調整</h3>
                        <span className="text-xs text-slate-400">正数で付与、負数で減算</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="number"
                          value={grantAmount}
                          onChange={(event) => setGrantAmount(Number(event.target.value))}
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={grantDescription}
                          onChange={(event) => setGrantDescription(event.target.value)}
                          placeholder="メモ (任意)"
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={userActionLoading}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                          実行
                        </button>
                      </div>
                    </form>

                    {userActionError && (
                      <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {userActionError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white">最新トランザクション</h3>
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-slate-200">
                          <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                              <th className="px-3 py-2 text-left">日時</th>
                              <th className="px-3 py-2 text-left">タイプ</th>
                              <th className="px-3 py-2 text-right">ポイント</th>
                              <th className="px-3 py-2 text-left">メモ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70">
                            {selectedUserDetail.transactions.slice(0, 8).map((tx) => (
                              <tr key={tx.id}>
                                <td className="px-3 py-2 text-xs text-slate-400">{formatDateTime(tx.created_at)}</td>
                                <td className="px-3 py-2 text-xs">{tx.transaction_type}</td>
                                <td className={`px-3 py-2 text-right text-sm font-semibold ${tx.amount >= 0 ? 'text-emerald-200' : 'text-red-300'}`}>
                                  {formatPoints(tx.amount)}
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-400 truncate">{tx.description || '-'}</td>
                              </tr>
                            ))}
                            {selectedUserDetail.transactions.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">
                                  トランザクションがありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white">LP 作成履歴</h3>
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-slate-200">
                          <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                              <th className="px-3 py-2 text-left">タイトル</th>
                              <th className="px-3 py-2 text-left">ステータス</th>
                              <th className="px-3 py-2 text-right">ビュー</th>
                              <th className="px-3 py-2 text-right">CTA</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70">
                            {selectedUserDetail.landing_pages.slice(0, 6).map((lp) => (
                              <tr key={lp.id}>
                                <td className="px-3 py-2 text-xs text-slate-300">{lp.title}</td>
                                <td className="px-3 py-2 text-xs">{lp.status}</td>
                                <td className="px-3 py-2 text-right text-xs">{formatNumber(lp.total_views)}</td>
                                <td className="px-3 py-2 text-right text-xs">{formatNumber(lp.total_cta_clicks)}</td>
                              </tr>
                            ))}
                            {selectedUserDetail.landing_pages.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">
                                  LP作成履歴がありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white">商品購入履歴</h3>
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-slate-200">
                          <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                              <th className="px-3 py-2 text-left">商品</th>
                              <th className="px-3 py-2 text-left">メモ</th>
                              <th className="px-3 py-2 text-right">ポイント</th>
                              <th className="px-3 py-2 text-left">日時</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70">
                            {selectedUserDetail.purchase_history.slice(0, 6).map((purchase) => (
                              <tr key={purchase.transaction_id}>
                                <td className="px-3 py-2 text-xs text-slate-300">{purchase.product_title || '-'}</td>
                                <td className="px-3 py-2 text-xs text-slate-400 truncate">{purchase.description || '-'}</td>
                                <td className="px-3 py-2 text-right text-xs text-red-300">{formatPoints(purchase.amount)}</td>
                                <td className="px-3 py-2 text-xs text-slate-400">{formatDateTime(purchase.created_at)}</td>
                              </tr>
                            ))}
                            {selectedUserDetail.purchase_history.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">
                                  商品購入履歴がありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">マーケット監視</h2>
                  <p className="text-xs text-slate-400 mt-1">公開中または非公開化したLPを確認し、違反コンテンツを素早く処理します。</p>
                </div>
                <button
                  onClick={() => fetchMarketplace(marketSearch)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-slate-800 hover:bg-slate-800"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  更新
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  fetchMarketplace(marketSearch);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  value={marketSearch}
                  onChange={(event) => setMarketSearch(event.target.value)}
                  placeholder="LPタイトル・スラッグで検索"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    検索
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketSearch('');
                      fetchMarketplace();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    リセット
                  </button>
                </div>
              </form>

              {marketError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {marketError}
                </div>
              )}

              <div className="hidden sm:block border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-slate-200">
                  <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">LPタイトル</th>
                      <th className="px-4 py-3 text-left">販売者</th>
                      <th className="px-4 py-3 text-right">ビュー</th>
                      <th className="px-4 py-3 text-right">CTA</th>
                      <th className="px-4 py-3 text-left">ステータス</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {marketLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">読み込み中...</td>
                      </tr>
                    ) : marketplaceItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">対象のLPがありません</td>
                      </tr>
                    ) : (
                      marketplaceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="text-sm text-white">{item.title}</div>
                            <div className="text-xs text-slate-500">/{item.slug}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="text-slate-200">{item.seller_username}</div>
                            <div className="text-slate-500">{item.seller_email}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-xs">{formatNumber(item.total_views)}</td>
                          <td className="px-4 py-3 text-right text-xs">{formatNumber(item.total_cta_clicks)}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                              item.status === 'published'
                                ? 'bg-emerald-500/15 text-emerald-200'
                                : item.status === 'archived'
                                ? 'bg-red-500/15 text-red-200'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleUpdateLPStatus(item.id, 'archived')}
                                className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-700"
                              >
                                非公開
                              </button>
                              <button
                                onClick={() => handleUpdateLPStatus(item.id, 'published')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/80 text-white hover:bg-emerald-600"
                              >
                                公開
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden space-y-3">
                {marketLoading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 text-sm">読み込み中...</div>
                ) : marketplaceItems.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 text-sm">対象のLPがありません</div>
                ) : (
                  marketplaceItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-slate-200 space-y-3">
                      <div>
                        <div className="text-base font-semibold text-white">{item.title}</div>
                        <div className="text-xs text-slate-500 truncate">/{item.slug}</div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-slate-400">
                        <span>販売者: {item.seller_username}</span>
                        <span className="break-all">{item.seller_email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>ビュー: {formatNumber(item.total_views)}</span>
                        <span>CTA: {formatNumber(item.total_cta_clicks)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            item.status === 'published'
                              ? 'bg-emerald-500/15 text-emerald-200'
                              : item.status === 'archived'
                              ? 'bg-red-500/15 text-red-200'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateLPStatus(item.id, 'archived')}
                            className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            非公開
                          </button>
                          <button
                            onClick={() => handleUpdateLPStatus(item.id, 'published')}
                            className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            公開
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">ポイント決済 売上分析</h2>
                  <p className="text-xs text-slate-400 mt-1">期間内のポイント購入・利用・付与のバランスを把握します。</p>
                </div>
                <button
                  onClick={() => fetchAnalytics()}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-slate-800 hover:bg-slate-800"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  更新
                </button>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                  分析データを読み込み中...
                </div>
              ) : analyticsError ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {analyticsError}
                </div>
              ) : !analytics ? (
                <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                  分析データがありません
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-slate-800 bg-blue-600/20 p-4">
                      <p className="text-xs text-blue-100">総ポイント購入</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatPoints(totals?.purchased || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-red-600/20 p-4">
                      <p className="text-xs text-red-100">マーケット消費</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatPoints(totals?.spent || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-emerald-500/20 p-4">
                      <p className="text-xs text-emerald-100">管理者付与</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatPoints(totals?.granted || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs text-slate-400">その他取引</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatPoints(totals?.other || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs text-slate-400">ネット計</p>
                      <p className={`mt-2 text-2xl font-semibold ${totals && totals.net >= 0 ? 'text-emerald-200' : 'text-red-300'}`}>
                        {formatPoints(totals?.net || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">直近日次トレンド</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-200">
                        <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-3 py-2 text-left">日付</th>
                            <th className="px-3 py-2 text-right">購入</th>
                            <th className="px-3 py-2 text-right">利用</th>
                            <th className="px-3 py-2 text-right">付与</th>
                            <th className="px-3 py-2 text-right">ネット</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {topDailyBreakdown.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                                データがありません
                              </td>
                            </tr>
                          ) : (
                            topDailyBreakdown.map((row) => (
                              <tr key={row.label}>
                                <td className="px-3 py-2 text-slate-300">{row.label}</td>
                                <td className="px-3 py-2 text-right text-emerald-200">{formatPoints(row.purchased)}</td>
                                <td className="px-3 py-2 text-right text-red-300">{formatPoints(row.spent)}</td>
                                <td className="px-3 py-2 text-right text-slate-200">{formatPoints(row.granted)}</td>
                                <td className={`px-3 py-2 text-right ${row.net >= 0 ? 'text-emerald-200' : 'text-red-300'}`}>{formatPoints(row.net)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">月次合計</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-200">
                        <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-3 py-2 text-left">月</th>
                            <th className="px-3 py-2 text-right">購入</th>
                            <th className="px-3 py-2 text-right">利用</th>
                            <th className="px-3 py-2 text-right">付与</th>
                            <th className="px-3 py-2 text-right">ネット</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {analytics.monthly.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                                データがありません
                              </td>
                            </tr>
                          ) : (
                            analytics.monthly.map((row) => (
                              <tr key={row.label}>
                                <td className="px-3 py-2 text-slate-300">{row.label}</td>
                                <td className="px-3 py-2 text-right text-emerald-200">{formatPoints(row.purchased)}</td>
                                <td className="px-3 py-2 text-right text-red-300">{formatPoints(row.spent)}</td>
                                <td className="px-3 py-2 text-right text-slate-200">{formatPoints(row.granted)}</td>
                                <td className={`px-3 py-2 text-right ${row.net >= 0 ? 'text-emerald-200' : 'text-red-300'}`}>{formatPoints(row.net)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.9)]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">お知らせコラム管理</h2>
                    <p className="text-sm text-slate-400">
                      ダッシュボード下部に掲載される公式アナウンスを作成・更新できます。顧客コミュニケーションの基点としてご活用ください。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetAnnouncementForm}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
                  >
                    {editingAnnouncementId ? '新規作成モードに戻る' : '入力内容をクリア'}
                  </button>
                </div>

                <form onSubmit={handleAnnouncementSubmit} className="space-y-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">タイトル</label>
                      <input
                        type="text"
                        value={announcementTitle}
                        onChange={(event) => setAnnouncementTitle(event.target.value)}
                        required
                        maxLength={200}
                        placeholder="例：年末年始サポート体制のご案内"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">掲載日時</label>
                      <input
                        type="datetime-local"
                        value={announcementPublishedAt}
                        onChange={(event) => setAnnouncementPublishedAt(event.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                        required
                      />
                      <p className="mt-1 text-xs text-slate-500">配信日時を指定できます。未設定の場合は現在時刻で公開されます。</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">サマリー</label>
                    <input
                      type="text"
                      value={announcementSummary}
                      onChange={(event) => setAnnouncementSummary(event.target.value)}
                      required
                      maxLength={255}
                      placeholder="例：【重要】 新料金プラン提供のお知らせ"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">ダッシュボードでは投稿日とサマリーのみ表示され、クリックで本文をモーダル表示します。</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">本文</label>
                    <textarea
                      value={announcementBody}
                      onChange={(event) => setAnnouncementBody(event.target.value)}
                      required
                      rows={8}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                      placeholder="本文を入力してください。改行で段落を構成できます。"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={announcementPublished}
                        onChange={(event) => setAnnouncementPublished(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                      />
                      公開中として表示
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={announcementHighlight}
                        onChange={(event) => setAnnouncementHighlight(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                      トップで強調表示
                    </label>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
                      <p className="font-semibold text-slate-200">運用メモ</p>
                      <p className="mt-1">強調表示をオンにすると、ダッシュボードで企業のお知らせとして目立つピル表示が追加されます。</p>
                    </div>
                  </div>

                  {announcementsError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                      {announcementsError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="submit"
                      disabled={announcementSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {editingAnnouncementId ? 'お知らせを更新する' : 'お知らせを公開する'}
                    </button>
                    {editingAnnouncementId && (
                      <button
                        type="button"
                        onClick={resetAnnouncementForm}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500"
                      >
                        新規作成に戻る
                      </button>
                    )}
                    <span className="text-xs text-slate-500">保存すると即座に利用者ダッシュボードに反映されます。</span>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                  <div>
                    <h3 className="text-lg font-semibold text-white">公開済み／下書き一覧</h3>
                    <p className="text-sm text-slate-400">投稿日とサマリーを一覧で確認できます。各項目から素早く編集・削除が可能です。</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAnnouncements}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
                  >
                    <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                    最新情報を取得
                  </button>
                </div>

                {announcementsLoading ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-400">読み込み中です...</div>
                ) : announcements.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-slate-400">
                    まだお知らせは登録されていません。企業の取り組みやメンテナンス情報を発信しましょう。
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">{formatDate(announcement.published_at)}</span>
                            {!announcement.is_published && (
                              <span className="inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">Draft</span>
                            )}
                            {announcement.highlight && announcement.is_published && (
                              <span className="inline-flex items-center rounded-full border border-blue-500/50 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-200">Highlight</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{announcement.title}</p>
                          <p className="text-xs text-slate-400 truncate">{announcement.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAnnouncementEdit(announcement)}
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-100 hover:bg-blue-500/20"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleAnnouncementDelete(announcement.id)}
                            disabled={announcementSaving}
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">モデレーションログ</h2>
                  <p className="text-xs text-slate-400 mt-1">管理者によるステータス変更やブロック操作の履歴を確認できます。</p>
                </div>
                <button
                  onClick={() => fetchLogs()}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-slate-800 hover:bg-slate-800"
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
                  更新
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <table className="w-full text-sm text-slate-200">
                  <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">日時</th>
                      <th className="px-4 py-3 text-left">アクション</th>
                      <th className="px-4 py-3 text-left">対象ユーザー</th>
                      <th className="px-4 py-3 text-left">対象LP</th>
                      <th className="px-4 py-3 text-left">理由</th>
                      <th className="px-4 py-3 text-left">実行者</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">読み込み中...</td>
                      </tr>
                    ) : logsError ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-200">
                          {logsError}
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">ログがありません</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(log.created_at)}</td>
                          <td className="px-4 py-3 text-xs text-white">{log.action}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{log.target_user_id || '-'}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{log.target_lp_id || '-'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 truncate">{log.reason || '-'}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{log.performed_by_username || log.performed_by_email || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
