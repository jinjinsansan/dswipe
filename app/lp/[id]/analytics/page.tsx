'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPAnalytics } from '@/types';
import DSwipeLogo from '@/components/DSwipeLogo';

export default function LPAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const lpId = params.id as string;
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();

  const [analytics, setAnalytics] = useState<LPAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError('');
      const response = await analyticsApi.getLPAnalytics(lpId);
      setAnalytics(response.data);
    } catch {
      setError('分析データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [lpId]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [fetchAnalytics, isAuthenticated, isInitialized, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">分析データを読み込み中です…</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">分析データが見つかりませんでした。</div>
      </div>
    );
  }

  const totalViews = analytics.total_views.toLocaleString();
  const totalSessions = analytics.total_sessions.toLocaleString();
  const totalCtaClicks = analytics.total_cta_clicks.toLocaleString();
  const conversionRate = `${analytics.cta_conversion_rate.toFixed(1)}%`;
  const publicUrl = `${baseUrl}/view/${analytics.slug}`;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="hidden md:flex w-60 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex-col">
        <div className="px-6 h-16 border-b border-slate-800 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📊</span>
              ダッシュボード
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-600">HOME</span>
          </Link>

          <Link
            href={`/lp/${lpId}/edit`}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">✏️</span>
              LP編集
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-600">EDIT</span>
          </Link>

          <Link
            href={`/lp/${lpId}/analytics`}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-white bg-blue-600/90 transition-colors text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📈</span>
              LP分析
            </span>
            <span className="text-[10px] uppercase tracking-widest text-blue-100">REPORT</span>
          </Link>

          <Link
            href="/media"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🗂️</span>
              メディア
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-600">LIBRARY</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/40 bg-red-600/10 px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-600/20"
          >
            ログアウト
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 h-16 px-3 sm:px-6 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-white truncate">LP分析レポート</h1>
            <p className="text-xs text-slate-400 truncate">{analytics.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5">
              <span className="text-[11px] uppercase tracking-widest text-slate-500">Status</span>
              <span className="text-sm font-semibold text-white">
                {analytics.status === 'published' ? '公開中' : '下書き'}
              </span>
            </div>
            <button
              onClick={() => setShowMobileMenu((prev) => !prev)}
              className="md:hidden rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {showMobileMenu && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900/80 px-4 py-3 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="flex items-center gap-2">
                <span>📊</span>
                ダッシュボード
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">HOME</span>
            </Link>
            <Link
              href={`/lp/${lpId}/edit`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="flex items-center gap-2">
                <span>✏️</span>
                LP編集
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">EDIT</span>
            </Link>
            <Link
              href={`/lp/${lpId}/analytics`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-white bg-blue-600/90 text-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="flex items-center gap-2">
                <span>📈</span>
                LP分析
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-100">REPORT</span>
            </Link>
            <Link
              href="/media"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 text-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="flex items-center gap-2">
                <span>🗂️</span>
                メディア
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">LIBRARY</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-red-500/40 bg-red-600/10 px-3 py-2 text-xs font-semibold text-red-200"
            >
              ログアウト
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-600/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard label="総閲覧数" value={totalViews} icon="👁️" />
              <MetricCard label="総セッション数" value={totalSessions} icon="📈" />
              <MetricCard label="CTAクリック" value={totalCtaClicks} icon="🎯" />
              <MetricCard label="CTA転換率" value={conversionRate} icon="⚡" accent="text-emerald-300" />
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">ステップファネル分析</h2>
                <span className="text-xs text-slate-500">各ステップの閲覧と離脱状況</span>
              </div>

              {analytics.step_funnel.length === 0 ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-12 text-center text-sm text-slate-400">
                  データがまだ蓄積されていません。
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.step_funnel.map((step) => {
                    const base = analytics.step_funnel[0]?.step_views || 0;
                    const width = base > 0 ? Math.max((step.step_views / base) * 100, 4) : 0;
                    return (
                      <div key={step.step_id} className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-[11px] font-semibold">
                              {step.step_order + 1}
                            </span>
                            <span>ステップ {step.step_order + 1}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>閲覧 {step.step_views}</span>
                            <span>離脱 {step.step_exits}</span>
                            <span className="text-emerald-300 font-medium">転換率 {step.conversion_rate.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="relative h-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                          <div
                            className="absolute inset-y-0 left-0 flex items-center justify-end rounded-r-xl bg-gradient-to-r from-blue-600/80 to-blue-400/80 px-3 text-sm font-semibold text-white"
                            style={{ width: `${width}%` }}
                          >
                            {width > 12 && <span>{Math.round(width)}%</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">CTAクリック分析</h2>
                <span className="text-xs text-slate-500">CTAごとのクリック分布</span>
              </div>

              {analytics.cta_clicks.length === 0 ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-12 text-center text-sm text-slate-400">
                  クリックデータがまだありません。
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.cta_clicks.map((cta, index) => {
                    const max = Math.max(...analytics.cta_clicks.map((c) => c.click_count));
                    const width = max > 0 ? Math.max((cta.click_count / max) * 100, 4) : 0;
                    return (
                      <div key={cta.cta_id} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="text-slate-300">
                            CTA #{index + 1}（{cta.cta_type}）
                          </span>
                          <span className="text-emerald-300 font-medium">{cta.click_count} クリック</span>
                        </div>
                        <div className="relative h-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                          <div
                            className="absolute inset-y-0 left-0 rounded-r-xl bg-gradient-to-r from-emerald-500/80 to-emerald-300/80"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white mb-3">公開URL</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 rounded-xl border border-blue-500/40 bg-slate-950/80 px-4 py-2 text-sm text-blue-100 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      alert('URLをコピーしました');
                    }}
                    className="rounded-xl border border-blue-400/60 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-500/30"
                  >
                    コピー
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200/20 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    プレビュー
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  accent?: string;
}

function MetricCard({ label, value, icon, accent }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Snapshot</span>
      </div>
      <p className={`text-2xl font-semibold text-white ${accent ?? ''}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
