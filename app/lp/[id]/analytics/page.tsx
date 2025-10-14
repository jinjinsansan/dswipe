'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { analyticsApi, lpApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LPAnalytics } from '@/types';

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
  }, [isAuthenticated, lpId]);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsApi.getLPAnalytics(lpId);
      setAnalytics(response.data);
    } catch (err) {
      setError('分析データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">分析データが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-2xl font-bold text-white">
                SwipeLaunch
              </Link>
              <div className="text-sm text-gray-400 mt-1">分析: {analytics.title}</div>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/lp/${lpId}/edit`}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                編集に戻る
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 統計サマリー */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-gray-400 text-sm mb-2">総閲覧数</div>
            <div className="text-4xl font-bold text-white">{analytics.total_views.toLocaleString()}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-gray-400 text-sm mb-2">総セッション数</div>
            <div className="text-4xl font-bold text-white">{analytics.total_sessions.toLocaleString()}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-gray-400 text-sm mb-2">CTAクリック数</div>
            <div className="text-4xl font-bold text-white">{analytics.total_cta_clicks.toLocaleString()}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-gray-400 text-sm mb-2">CTA転換率</div>
            <div className="text-4xl font-bold text-green-400">
              {analytics.cta_conversion_rate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* ステップファネル */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">ステップファネル</h2>
          <div className="space-y-4">
            {analytics.step_funnel.map((step, index) => {
              const width = analytics.step_funnel[0].step_views > 0
                ? (step.step_views / analytics.step_funnel[0].step_views) * 100
                : 0;
              
              return (
                <div key={step.step_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">
                      ステップ #{step.step_order + 1}
                    </span>
                    <div className="flex items-center gap-6 text-gray-400">
                      <span>閲覧: {step.step_views}</span>
                      <span>離脱: {step.step_exits}</span>
                      <span className="text-green-400">転換率: {step.conversion_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-900 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center transition-all duration-300"
                      style={{ width: `${width}%` }}
                    >
                      {width > 10 && (
                        <span className="text-white text-sm font-semibold">
                          {width.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {analytics.step_funnel.length === 0 && (
            <p className="text-gray-400 text-center py-8">まだデータがありません</p>
          )}
        </div>

        {/* CTAクリック分析 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">CTAクリック分析</h2>
          
          {analytics.cta_clicks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">まだデータがありません</p>
          ) : (
            <div className="space-y-4">
              {analytics.cta_clicks.map((cta, index) => {
                const maxClicks = Math.max(...analytics.cta_clicks.map(c => c.click_count));
                const width = maxClicks > 0 ? (cta.click_count / maxClicks) * 100 : 0;
                
                return (
                  <div key={cta.cta_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        CTA #{index + 1} ({cta.cta_type})
                      </span>
                      <span className="text-gray-400">
                        クリック数: {cta.click_count}
                      </span>
                    </div>
                    <div className="relative h-8 bg-gray-900 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center transition-all duration-300"
                        style={{ width: `${width}%` }}
                      >
                        {width > 10 && (
                          <span className="text-white text-sm font-semibold">
                            {cta.click_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 公開URL */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-2">公開URL</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/view/${analytics.slug}`}
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/view/${analytics.slug}`);
                alert('URLをコピーしました！');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              コピー
            </button>
            <a
              href={`/view/${analytics.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              プレビュー
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
