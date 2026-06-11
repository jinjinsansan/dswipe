'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useCallback, useEffect, useMemo, useState, Component, ErrorInfo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPAnalytics, StepFunnelData, CTAClickData } from '@/types';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { redirectToLogin } from '@/lib/navigation';

/* Momentum LP analytics — mock: design_handoff_dswipe/D-Swipe Analytics.html */

import { GRAD_BRAND } from '@/lib/momentum';

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
        <div className="min-h-screen bg-canvas p-8">
          <div className="max-w-4xl mx-auto bg-white border border-red-200 rounded-2xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラー詳細</h1>
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 font-mono text-sm overflow-auto">
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
  const { isAuthenticated, isInitialized } = useAuthStore();

  const [analytics, setAnalytics] = useState<LPAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setError('');
      const response = await analyticsApi.getLPAnalytics(lpId);
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
      redirectToLogin(router);
      return;
    }

    fetchAnalytics();
  }, [fetchAnalytics, isAuthenticated, isInitialized, router]);

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  const stepFunnel = useMemo(() => {
    const raw = Array.isArray(analytics?.step_funnel) ? analytics.step_funnel ?? [] : [];
    return raw
      .filter((step): step is StepFunnelData => step && typeof step === 'object' && 'step_order' in step)
      .map((step) => ({
        ...step,
        step_views: Math.max(0, Number(step.step_views || 0)),
        step_exits: Math.max(0, Number(step.step_exits || 0)),
        conversion_rate: Math.max(0, Math.min(100, Number(step.conversion_rate || 0))),
      }));
  }, [analytics]);

  const ctaClicks = useMemo(() => {
    const raw = Array.isArray(analytics?.cta_clicks) ? analytics.cta_clicks ?? [] : [];
    return raw.filter((cta): cta is CTAClickData => cta && typeof cta === 'object');
  }, [analytics]);

  const stepOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    stepFunnel.forEach((step) => {
      if (step.step_id) {
        map.set(step.step_id, step.step_order);
      }
    });
    return map;
  }, [stepFunnel]);

  if (isLoading || !isInitialized) {
    return <PageLoader />;
  }

  if (!analytics) {
    return (
      <DashboardLayout pageTitle="LP分析レポート">
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <div className="text-center bg-white border border-line-soft rounded-2xl shadow-sm px-10 py-12">
            <p className="text-lg font-semibold text-navy-900">分析データが見つかりませんでした。</p>
            <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold text-sky-600 hover:text-sky-500 transition-colors">
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalViews = Number(analytics.total_views || 0).toLocaleString();
  const totalSessions = Number(analytics.total_sessions || 0).toLocaleString();
  const totalCtaClicks = Number(analytics.total_cta_clicks || 0).toLocaleString();
  const conversionRateValue = typeof analytics.cta_conversion_rate === 'number' ? analytics.cta_conversion_rate : 0;
  const conversionRate = `${conversionRateValue.toFixed(1)}%`;
  const publicUrl = `${baseUrl}/view/${analytics.slug}`;

  return (
    <ErrorBoundary>
      <DashboardLayout pageTitle="LP分析レポート" pageSubtitle={analytics.title}>
        <div className="px-4 sm:px-6 py-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Status + actions */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  analytics.status === 'published'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${analytics.status === 'published' ? 'bg-green-500' : 'bg-slate-400'}`} />
                {analytics.status === 'published' ? '公開中' : '下書き'}
              </span>
              <Link
                href={`/lp/${lpId}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-tint-border hover:text-sky-600 transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                LPを編集
              </Link>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* KPI strip */}
            <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: '総閲覧数', value: totalViews, accent: false },
                { label: '総セッション数', value: totalSessions, accent: false },
                { label: 'CTAクリック', value: totalCtaClicks, accent: false },
                { label: 'CTA転換率', value: conversionRate, accent: true },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-line-soft bg-white shadow-sm p-4 sm:p-5">
                  <p className={`text-2xl font-extrabold tracking-tight tabular-nums ${kpi.accent ? 'text-sky-600' : 'text-navy-900'}`}>{kpi.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{kpi.label}</p>
                </div>
              ))}
            </section>

            {/* Step funnel */}
            <section className="rounded-2xl border border-line-soft bg-white shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy-900">ステップファネル分析</h2>
                <span className="text-xs text-slate-500">各ステップの閲覧と離脱状況</span>
              </div>

              {stepFunnel.length === 0 ? (
                <div className="rounded-xl border border-dashed border-tint-border bg-[#f8fafc] py-12 text-center text-sm text-slate-500">
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
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint text-sky-700 text-[11px] font-bold">
                              {step.step_order + 1}
                            </span>
                            <span className="font-semibold">ステップ {step.step_order + 1}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>閲覧 {step.step_views}</span>
                            <span>離脱 {step.step_exits}</span>
                            <span className="text-green-700 font-bold">転換率 {conversionLabel}%</span>
                          </div>
                        </div>
                        <div className="relative h-8 overflow-hidden rounded-xl border border-line-soft bg-[#f8fafc]">
                          <div
                            className="absolute inset-y-0 left-0 flex items-center justify-end rounded-r-xl px-3 text-sm font-bold text-pure-white"
                            style={{ width: `${width}%`, background: GRAD_BRAND }}
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

            {/* CTA clicks */}
            <section className="rounded-2xl border border-line-soft bg-white shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy-900">CTAクリック分析</h2>
                <span className="text-xs text-slate-500">CTAごとのクリック分布</span>
              </div>

              {ctaClicks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-tint-border bg-[#f8fafc] py-12 text-center text-sm text-slate-500">
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
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">
                              {baseLabel}
                              {typeLabel}
                            </span>
                            <span className="text-green-700 font-bold">{clickCount} クリック</span>
                          </div>
                          <div className="relative h-6 overflow-hidden rounded-xl border border-line-soft bg-[#f8fafc]">
                            <div
                              className="absolute inset-y-0 left-0 rounded-r-xl bg-gradient-to-r from-emerald-500 to-emerald-400"
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

            {/* Public URL */}
            <section className="rounded-2xl border border-tint-border bg-brand-tint p-5 sm:p-6">
              <h3 className="text-sm font-bold text-navy-900 mb-3">公開URL</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 rounded-xl border border-tint-border bg-white px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      alert('URLをコピーしました');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-pure-white shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)] transition-shadow"
                    style={{ background: GRAD_BRAND }}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
                    コピー
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-pure-white hover:bg-navy-800 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                    プレビュー
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}
