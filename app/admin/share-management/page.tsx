'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { AdminPageTab } from '@/components/admin/AdminShell';
import { useAuthStore } from '@/store/authStore';
import {
  ChartBarIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  ArrowPathIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface ShareOverviewStats {
  total_shares: number;
  total_reward_points: number;
  today_shares: number;
  this_week_shares: number;
  this_month_shares: number;
}

interface TopCreator {
  user_id: string;
  username: string;
  email: string;
  total_shares: number;
  total_reward_points: number;
}

interface TopNote {
  note_id: string;
  title: string;
  author_username: string;
  share_count: number;
  total_reward_points: number;
}

interface ShareLogItem {
  id: string;
  note_title: string;
  author_username: string;
  shared_by_username: string;
  tweet_url: string;
  shared_at: string;
  verified: boolean;
  points_amount: number;
  is_suspicious: boolean;
}

interface FraudAlert {
  id: string;
  alert_type: string;
  severity: string;
  description: string;
  note_title?: string;
  username?: string;
  created_at: string;
  resolved: boolean;
}

interface RewardSettings {
  points_per_share: number;
}

type ShareTab = 'overview' | 'logs' | 'alerts' | 'settings';

const SHARE_NAV_ITEMS: Array<AdminPageTab & { id: ShareTab }> = [
  { id: 'overview', label: '統計サマリー', icon: ChartBarIcon },
  { id: 'logs', label: 'シェアログ', icon: ShareIcon },
  { id: 'alerts', label: '不正検知', icon: ExclamationTriangleIcon },
  { id: 'settings', label: '報酬設定', icon: CogIcon },
];
export default function ShareManagementPage() {
  const router = useRouter();
  const { token, isAdmin, isAuthenticated, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ShareTab>('overview');

  // Overview stats
  const [stats, setStats] = useState<ShareOverviewStats | null>(null);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [topNotes, setTopNotes] = useState<TopNote[]>([]);

  // Share logs
  const [shareLogs, setShareLogs] = useState<ShareLogItem[]>([]);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);

  // Fraud alerts
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [showResolved, setShowResolved] = useState(false);

  // Settings
  const [rewardSettings, setRewardSettings] = useState<RewardSettings | null>(null);
  const [newRate, setNewRate] = useState('');
  const [savingRate, setSavingRate] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';

    try {
      if (activeTab === 'overview') {
        const [statsRes, creatorsRes, notesRes] = await Promise.all([
          fetch(`${apiUrl}/admin/share-stats/overview`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/admin/share-stats/top-creators?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/admin/share-stats/top-notes?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (creatorsRes.ok) setTopCreators(await creatorsRes.json());
        if (notesRes.ok) setTopNotes(await notesRes.json());
      } else if (activeTab === 'logs') {
        const logsRes = await fetch(
          `${apiUrl}/admin/shares?limit=50&suspicious_only=${suspiciousOnly}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (logsRes.ok) setShareLogs(await logsRes.json());
      } else if (activeTab === 'alerts') {
        const alertsRes = await fetch(
          `${apiUrl}/admin/fraud-alerts?resolved=${showResolved}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (alertsRes.ok) setAlerts(await alertsRes.json());
      } else if (activeTab === 'settings') {
        const settingsRes = await fetch(`${apiUrl}/admin/share-reward-settings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setRewardSettings(data);
          setNewRate(String(data.points_per_share));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, suspiciousOnly, showResolved]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || !isAdmin) {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [isInitialized, isAuthenticated, isAdmin, router, fetchData]);

  const handleResolveAlert = async (alertId: string) => {
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const res = await fetch(`${apiUrl}/admin/fraud-alerts/${alertId}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        fetchData();
        alert('アラートを解決済みにしました');
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleUpdateRewardRate = async () => {
    if (!token || !newRate) return;

    const rateValue = parseInt(newRate);
    if (isNaN(rateValue) || rateValue < 0) {
      alert('有効なポイント数を入力してください');
      return;
    }

    setSavingRate(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const res = await fetch(`${apiUrl}/admin/share-reward-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points_per_share: rateValue }),
      });

      if (res.ok) {
        alert('報酬レートを更新しました');
        fetchData();
      } else {
        throw new Error('更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update rate:', error);
      alert('報酬レートの更新に失敗しました');
    } finally {
      setSavingRate(false);
    }
  };

  if (!isInitialized || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <AdminShell
      pageTitle="NOTEシェア管理"
      pageSubtitle="シェア統計・不正検知・報酬設定"
      sideNavItems={SHARE_NAV_ITEMS}
      activeSideNav={activeTab}
      onSideNavChange={(tabId) => setActiveTab(tabId as ShareTab)}
      sideNavTitle="セクション"
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* 統計サマリー */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 全体統計カード */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">総シェア数</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.total_shares.toLocaleString() || 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">総報酬P</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{stats?.total_reward_points.toLocaleString() || 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">今日</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600">{stats?.today_shares.toLocaleString() || 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">今週</p>
                    <p className="mt-2 text-2xl font-bold text-indigo-600">{stats?.this_week_shares.toLocaleString() || 0}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">今月</p>
                    <p className="mt-2 text-2xl font-bold text-purple-600">{stats?.this_month_shares.toLocaleString() || 0}</p>
                  </div>
                </div>

                {/* トップインフォプレナー */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <UserGroupIcon className="h-6 w-6 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">トップインフォプレナー</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <th className="pb-3">ユーザー名</th>
                          <th className="pb-3">メール</th>
                          <th className="pb-3 text-right">シェア数</th>
                          <th className="pb-3 text-right">獲得P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topCreators.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500">データがありません</td>
                          </tr>
                        ) : (
                          topCreators.map((creator) => (
                            <tr key={creator.user_id} className="hover:bg-slate-50">
                              <td className="py-3 font-semibold text-slate-900">{creator.username}</td>
                              <td className="py-3 text-slate-600">{creator.email}</td>
                              <td className="py-3 text-right font-semibold text-blue-600">{creator.total_shares.toLocaleString()}</td>
                              <td className="py-3 text-right font-semibold text-emerald-600">{creator.total_reward_points.toLocaleString()}P</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* トップNOTE */}
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="h-6 w-6 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">トップNOTE</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <th className="pb-3">タイトル</th>
                          <th className="pb-3">著者</th>
                          <th className="pb-3 text-right">シェア数</th>
                          <th className="pb-3 text-right">報酬P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topNotes.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500">データがありません</td>
                          </tr>
                        ) : (
                          topNotes.map((note) => (
                            <tr key={note.note_id} className="hover:bg-slate-50">
                              <td className="py-3 font-semibold text-slate-900">{note.title}</td>
                              <td className="py-3 text-slate-600">@{note.author_username}</td>
                              <td className="py-3 text-right font-semibold text-blue-600">{note.share_count.toLocaleString()}</td>
                              <td className="py-3 text-right font-semibold text-emerald-600">{note.total_reward_points.toLocaleString()}P</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* シェアログ */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">全シェアログ</h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={suspiciousOnly}
                      onChange={(e) => {
                        setSuspiciousOnly(e.target.checked);
                        fetchData();
                      }}
                      className="rounded border-slate-300"
                    />
                    不正疑いのみ表示
                  </label>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3">NOTE</th>
                        <th className="px-4 py-3">著者</th>
                        <th className="px-4 py-3">シェア者</th>
                        <th className="px-4 py-3">日時</th>
                        <th className="px-4 py-3 text-center">検証</th>
                        <th className="px-4 py-3 text-right">報酬P</th>
                        <th className="px-4 py-3 text-center">状態</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shareLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">データがありません</td>
                        </tr>
                      ) : (
                        shareLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{log.note_title}</td>
                            <td className="px-4 py-3 text-slate-600">@{log.author_username}</td>
                            <td className="px-4 py-3 text-slate-600">@{log.shared_by_username}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {new Date(log.shared_at).toLocaleString('ja-JP')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {log.verified ? (
                                <CheckCircleIcon className="mx-auto h-5 w-5 text-emerald-500" />
                              ) : (
                                <span className="text-xs text-slate-400">未検証</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                              {log.points_amount}P
                            </td>
                            <td className="px-4 py-3 text-center">
                              {log.is_suspicious ? (
                                <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
                                  疑わしい
                                </span>
                              ) : (
                                <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-600">
                                  正常
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 不正検知アラート */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">不正検知アラート</h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showResolved}
                      onChange={(e) => {
                        setShowResolved(e.target.checked);
                        fetchData();
                      }}
                      className="rounded border-slate-300"
                    />
                    解決済みを表示
                  </label>
                </div>
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
                      アラートはありません
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-xl border p-4 ${
                          alert.severity === 'high'
                            ? 'border-red-200 bg-red-50'
                            : alert.severity === 'medium'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                  alert.severity === 'high'
                                    ? 'bg-red-600 text-white'
                                    : alert.severity === 'medium'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="text-sm font-semibold text-slate-700">{alert.alert_type}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-700">{alert.description}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                              {alert.note_title && <span>NOTE: {alert.note_title}</span>}
                              {alert.username && <span>ユーザー: @{alert.username}</span>}
                              <span>{new Date(alert.created_at).toLocaleString('ja-JP')}</span>
                            </div>
                          </div>
                          {!alert.resolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="ml-4 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                            >
                              解決済みにする
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 報酬設定 */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">シェア報酬レート設定</h3>
                  <div className="space-y-4">
                    {rewardSettings && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-semibold text-emerald-900">現在の設定</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                          1シェア = {rewardSettings.points_per_share} ポイント
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-semibold text-slate-700">新しいレート（1シェアあたりのポイント）</label>
                      <div className="mt-2 flex gap-3">
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="例: 5"
                        />
                        <button
                          onClick={handleUpdateRewardRate}
                          disabled={savingRate}
                          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {savingRate ? '更新中...' : '更新'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        この設定を変更すると、以降のシェアに対する報酬ポイントが変更されます。既存のシェアには影響しません。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
