'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, UsersIcon, CursorArrowRaysIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPAnalytics } from '@/types';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Card, KpiCard, Button } from '@/components/ui';

export default function LPAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const lpId = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const [analytics, setAnalytics] = useState<LPAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, lpId]);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsApi.getLPAnalytics(lpId);
      setAnalytics(response.data);
    } catch {
      setError('分析データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-lg" style={{ color: 'var(--muted)' }}>
          {isLoading ? '読み込み中...' : '分析データが見つかりません'}
        </div>
      </div>
    );
  }

  const firstViews = analytics.step_funnel[0]?.step_views || 0;
  const maxClicks = analytics.cta_clicks.length ? Math.max(...analytics.cta_clicks.map((c) => c.click_count)) : 0;

  return (
    <DashboardShell
      title="LP分析"
      subtitle={analytics.title}
      actions={
        <>
          <Link href={`/lp/${lpId}/edit`} className="btn btn-secondary btn-sm">
            編集に戻る
          </Link>
          <Link href="/dashboard" className="btn btn-secondary btn-sm hidden sm:inline-flex">
            ダッシュボード
          </Link>
        </>
      }
    >
      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: 'var(--danger-tint)', borderColor: '#fcc', color: 'var(--danger-ink)' }}>
          {error}
        </div>
      )}

      {/* KPI summary */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard icon={<EyeIcon />} caption="総閲覧数" value={analytics.total_views.toLocaleString()} />
        <KpiCard icon={<UsersIcon />} softIcon caption="総セッション数" value={analytics.total_sessions.toLocaleString()} />
        <KpiCard icon={<CursorArrowRaysIcon />} caption="CTAクリック数" value={analytics.total_cta_clicks.toLocaleString()} />
        <KpiCard icon={<ArrowTrendingUpIcon />} softIcon caption="CTA転換率" value={`${analytics.cta_conversion_rate.toFixed(1)}%`} />
      </div>

      {/* Step funnel */}
      <Card>
        <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--ink)' }}>
          ステップファネル
        </h2>
        {analytics.step_funnel.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
            まだデータがありません
          </p>
        ) : (
          <div className="space-y-4">
            {analytics.step_funnel.map((step) => {
              const width = firstViews > 0 ? (step.step_views / firstViews) * 100 : 0;
              return (
                <div key={step.step_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text)' }}>ステップ #{step.step_order + 1}</span>
                    <div className="flex items-center gap-5" style={{ color: 'var(--muted)' }}>
                      <span>閲覧: {step.step_views}</span>
                      <span>離脱: {step.step_exits}</span>
                      <span style={{ color: 'var(--success-ink)' }}>転換率: {step.conversion_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="relative h-8 overflow-hidden rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    <div
                      className="absolute inset-y-0 left-0 flex items-center justify-center bg-brand-grad transition-all duration-300"
                      style={{ width: `${width}%` }}
                    >
                      {width > 10 && <span className="text-sm font-semibold text-white">{width.toFixed(0)}%</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* CTA clicks */}
      <Card>
        <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--ink)' }}>
          CTAクリック分析
        </h2>
        {analytics.cta_clicks.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
            まだデータがありません
          </p>
        ) : (
          <div className="space-y-4">
            {analytics.cta_clicks.map((cta, index) => {
              const width = maxClicks > 0 ? (cta.click_count / maxClicks) * 100 : 0;
              return (
                <div key={cta.cta_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text)' }}>
                      CTA #{index + 1} ({cta.cta_type})
                    </span>
                    <span style={{ color: 'var(--muted)' }}>クリック数: {cta.click_count}</span>
                  </div>
                  <div className="relative h-8 overflow-hidden rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    <div
                      className="absolute inset-y-0 left-0 flex items-center justify-center transition-all duration-300"
                      style={{ width: `${width}%`, background: 'linear-gradient(90deg,#16a34a,#22c55e)' }}
                    >
                      {width > 10 && <span className="text-sm font-semibold text-white">{cta.click_count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Public URL */}
      <Card style={{ background: 'var(--surface-tint)', borderColor: 'var(--tint-border)' }}>
        <h3 className="mb-2 font-bold" style={{ color: 'var(--ink)' }}>
          公開URL
        </h3>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/view/${analytics.slug}`}
            className="input flex-1"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/view/${analytics.slug}`);
              alert('URLをコピーしました！');
            }}
          >
            コピー
          </Button>
          <a href={`/view/${analytics.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            プレビュー
          </a>
        </div>
      </Card>
    </DashboardShell>
  );
}
