'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType, type SVGProps, Component, ErrorInfo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BoltIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  PencilSquareIcon,
  PhotoIcon,
  PresentationChartLineIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPAnalytics, StepFunnelData, CTAClickData } from '@/types';
import DSwipeLogo from '@/components/DSwipeLogo';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 p-8">
          <div className="max-w-4xl mx-auto bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">🔍 エラー詳細</h1>
            <div className="bg-slate-900 p-4 rounded text-red-300 font-mono text-sm overflow-auto">
              <p className="mb-2"><strong>エラーメッセージ:</strong></p>
              <pre className="whitespace-pre-wrap">{this.state.error?.message || 'Unknown error'}</pre>
              <p className="mt-4 mb-2"><strong>スタックトレース:</strong></p>
              <pre className="whitespace-pre-wrap text-xs">{this.state.error?.stack || 'No stack trace'}</pre>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
      console.log('Analytics API response:', response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
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

  const totalViews = Number(analytics.total_views || 0).toLocaleString();
  const totalSessions = Number(analytics.total_sessions || 0).toLocaleString();
  const totalCtaClicks = Number(analytics.total_cta_clicks || 0).toLocaleString();
  const conversionRateValue = typeof analytics.cta_conversion_rate === 'number' ? analytics.cta_conversion_rate : 0;
  const conversionRate = `${conversionRateValue.toFixed(1)}%`;
  const publicUrl = `${baseUrl}/view/${analytics.slug}`;
  const rawStepFunnel = Array.isArray(analytics.step_funnel) ? analytics.step_funnel : [];
  const rawCtaClicks = Array.isArray(analytics.cta_clicks) ? analytics.cta_clicks : [];
  
  // 安全なデータフィルタリング（異常値をクランプ）
  const stepFunnel = rawStepFunnel
    .filter((step): step is StepFunnelData => step && typeof step === 'object' && 'step_order' in step)
    .map(step => ({
      ...step,
      step_views: Math.max(0, Number(step.step_views || 0)),
      step_exits: Math.max(0, Number(step.step_exits || 0)),
      conversion_rate: Math.max(0, Math.min(100, Number(step.conversion_rate || 0)))
    }));
  
  const ctaClicks = rawCtaClicks.filter((cta): cta is CTAClickData => cta && typeof cta === 'object');

  const stepOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    stepFunnel.forEach((step) => {
      if (step.step_id) {
        map.set(step.step_id, step.step_order);
      }
    });
    return map;
  }, [stepFunnel]);

  return (
    <ErrorBoundary>
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
              <ChartBarSquareIcon className="h-4 w-4" aria-hidden="true" />
              ダッシュボード
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-600">HOME</span>
          </Link>

          <Link
            href={`/lp/${lpId}/edit`}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              LP編集
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-600">EDIT</span>
          </Link>

          <Link
            href={`/lp/${lpId}/analytics`}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-white bg-blue-600/90 transition-colors text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <PresentationChartLineIcon className="h-4 w-4" aria-hidden="true" />
              LP分析
            </span>
            <span className="text-[10px] uppercase tracking-widest text-blue-100">REPORT</span>
          </Link>

          <Link
            href="/media"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <PhotoIcon className="h-4 w-4" aria-hidden="true" />
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
                <ChartBarSquareIcon className="h-4 w-4" aria-hidden="true" />
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
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
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
                <PresentationChartLineIcon className="h-4 w-4" aria-hidden="true" />
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
                <PhotoIcon className="h-4 w-4" aria-hidden="true" />
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
              <MetricCard label="総閲覧数" value={totalViews} icon={EyeIcon} />
              <MetricCard label="総セッション数" value={totalSessions} icon={UsersIcon} />
              <MetricCard label="CTAクリック" value={totalCtaClicks} icon={CursorArrowRaysIcon} />
              <MetricCard label="CTA転換率" value={conversionRate} icon={BoltIcon} accent="text-emerald-300" />
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">ステップファネル分析</h2>
                <span className="text-xs text-slate-500">各ステップの閲覧と離脱状況</span>
              </div>

            {stepFunnel.length === 0 ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-12 text-center text-sm text-slate-400">
                  データがまだ蓄積されていません。
                </div>
              ) : (
                <div className="space-y-4">
                  {stepFunnel.map((step, index) => {
                    if (!step || !step.step_id) {
                      console.error('Invalid step at index', index, step);
                      return null;
                    }
                    const base = stepFunnel[0]?.step_views || 1;
                    const safeStepViews = Math.max(0, Number(step.step_views || 0));
                    const width = base > 0 ? Math.min(100, Math.max((safeStepViews / base) * 100, 4)) : 0;
                    const conversionLabel = typeof step.conversion_rate === 'number'
                      ? Math.min(100, Math.max(0, step.conversion_rate)).toFixed(1)
                      : '0.0';
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
                            <span className="text-emerald-300 font-medium">転換率 {conversionLabel}%</span>
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

              {ctaClicks.length === 0 ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-12 text-center text-sm text-slate-400">
                  クリックデータがまだありません。
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const maxClicks = Math.max(...ctaClicks.map((c) => Number(c.click_count || 0)), 1);
                    return ctaClicks.map((cta, index) => {
                      if (!cta) {
                        console.error('Invalid CTA at index', index);
                        return null;
                      }
                      const key = cta.cta_id ?? `${cta.step_id ?? 'unknown'}-${index}`;
                      const clickCount = Number(cta.click_count || 0);
                      const width = maxClicks > 0 ? Math.max((clickCount / maxClicks) * 100, 4) : 0;
                      const stepOrder = cta.step_id ? stepOrderMap.get(cta.step_id) : undefined;
                      const baseLabel = cta.cta_id
                        ? `CTA #${index + 1}`
                        : stepOrder !== undefined
                        ? `ステップ ${stepOrder + 1}`
                        : `CTA #${index + 1}`;
                      const typeLabel = cta.cta_type ? `（${cta.cta_type}）` : '';

                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="text-slate-300">
                              {baseLabel}
                              {typeLabel}
                            </span>
                            <span className="text-emerald-300 font-medium">{clickCount} クリック</span>
                          </div>
                          <div className="relative h-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                            <div
                              className="absolute inset-y-0 left-0 rounded-r-xl bg-gradient-to-r from-emerald-500/80 to-emerald-300/80"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
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
    </ErrorBoundary>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: string;
}

function MetricCard({ label, value, icon: Icon, accent }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className="h-5 w-5 text-slate-300" aria-hidden="true" />
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Snapshot</span>
      </div>
      <p className={`text-2xl font-semibold text-white ${accent ?? ''}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
