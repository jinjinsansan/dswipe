'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import DSwipeLogo from '@/components/DSwipeLogo';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type {
  AdminMarketplaceLP,
  AdminPointAnalytics,
  AdminPointAnalyticsBreakdown,
  AdminUserDetail,
  AdminUserSummary,
  ModerationEvent,
} from '@/types';

const TABS = [
  { id: 'users', label: 'ユーザー管理', icon: '👥' },
  { id: 'marketplace', label: 'マーケット監視', icon: '🧭' },
  { id: 'analytics', label: 'ポイント分析', icon: '📈' },
  { id: 'logs', label: 'モデレーションログ', icon: '📜' },
] as const;

type TabKey = (typeof TABS)[number]['id'];

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

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? fallback;
  }
  return fallback;
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

  const [usersError, setUsersError] = useState<string | null>(null);
  const [userActionError, setUserActionError] = useState<string | null>(null);

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
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <DSwipeLogo size="medium" showFullName />
              <span className="text-xs font-semibold tracking-[0.35em] text-red-400 uppercase">ADMIN</span>
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
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
        <div className="md:hidden border-t border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {activeTab === 'users' && (
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 xl:gap-8">
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
                    🔄 更新
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

                <div className="border border-slate-800 rounded-xl overflow-hidden">
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
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
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
                  🔄 更新
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

              <div className="border border-slate-800 rounded-2xl overflow-hidden">
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
                  🔄 更新
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
                  🔄 更新
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
