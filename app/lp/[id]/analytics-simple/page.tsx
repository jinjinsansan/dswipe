'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function SimpleAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const lpId = params.id as string;
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    analyticsApi.getLPAnalytics(lpId)
      .then(res => {
        console.log('Analytics loaded successfully');
        setData(res.data);
      })
      .catch(err => {
        console.error('Error loading analytics:', err);
        setError(err.message || '分析データの読み込みに失敗しました');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lpId, isAuthenticated, isInitialized, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">分析データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-4">エラー</h1>
          <pre className="bg-slate-900 p-4 rounded text-red-300 font-mono text-sm">{error}</pre>
          <Link 
            href="/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">データが見つかりませんでした</div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/view/${data.slug}`;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{data.title} - 分析レポート</h1>
            <p className="text-sm text-slate-400 mt-1">LP ID: {data.lp_id}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/lp/${lpId}/edit`}
              className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm"
            >
              編集
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              ダッシュボード
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{Number(data.total_views || 0).toLocaleString()}</div>
            <div className="text-sm text-slate-400">総閲覧数</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{Number(data.total_sessions || 0).toLocaleString()}</div>
            <div className="text-sm text-slate-400">総セッション数</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{Number(data.total_cta_clicks || 0).toLocaleString()}</div>
            <div className="text-sm text-slate-400">CTAクリック数</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {typeof data.cta_conversion_rate === 'number' ? data.cta_conversion_rate.toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-slate-400">CTA転換率</div>
          </div>
        </section>

        {/* Step Funnel */}
        <section className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">ステップファネル分析</h2>
          {data.step_funnel && data.step_funnel.length > 0 ? (
            <div className="space-y-4">
              {data.step_funnel.map((step: any, index: number) => {
                const base = data.step_funnel[0]?.step_views || 1;
                const views = Number(step.step_views || 0);
                const width = Math.min(100, Math.max(4, (views / base) * 100));
                const convRate = Math.min(100, Math.max(0, Number(step.conversion_rate || 0)));
                
                return (
                  <div key={step.step_id || index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold">
                          {step.step_order + 1}
                        </span>
                        <span>ステップ {step.step_order + 1}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <span className="text-slate-400">閲覧: <span className="text-white font-medium">{step.step_views}</span></span>
                        <span className="text-slate-400">離脱: <span className="text-white font-medium">{step.step_exits}</span></span>
                        <span className="text-emerald-400 font-medium">転換率: {convRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-end px-3"
                        style={{ width: `${width}%` }}
                      >
                        {width > 15 && (
                          <span className="text-white text-xs font-semibold">{Math.round(width)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              ステップファネルデータがありません
            </div>
          )}
        </section>

        {/* CTA Analysis */}
        <section className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">CTA別クリック分析</h2>
          {data.cta_clicks && data.cta_clicks.length > 0 ? (
            <div className="space-y-4">
              {data.cta_clicks.map((cta: any, index: number) => {
                const maxClicks = Math.max(...data.cta_clicks.map((c: any) => Number(c.click_count || 0)), 1);
                const clicks = Number(cta.click_count || 0);
                const width = Math.max(4, (clicks / maxClicks) * 100);
                const label = cta.cta_id ? `CTA #${index + 1}` : `ステップ CTA`;
                
                return (
                  <div key={cta.cta_id || index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{label} {cta.cta_type ? `(${cta.cta_type})` : ''}</span>
                      <span className="text-emerald-400 font-medium">{clicks} クリック</span>
                    </div>
                    <div className="relative h-6 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              CTAクリックデータがありません
            </div>
          )}
        </section>

        {/* Public URL */}
        <section className="bg-blue-900/20 border border-blue-500/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">公開URL</h3>
          <div className="flex gap-3">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded text-slate-300 text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                alert('URLをコピーしました');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              コピー
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm font-medium"
            >
              プレビュー
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
