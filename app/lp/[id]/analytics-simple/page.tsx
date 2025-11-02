'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  PencilSquareIcon,
  PhotoIcon,
  PresentationChartLineIcon,
  UsersIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DSwipeLogo from '@/components/DSwipeLogo';
import { redirectToLogin } from '@/lib/navigation';

export default function SimpleAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const lpId = params.id as string;
  const { isAuthenticated, isInitialized, user, logout } = useAuthStore();
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      redirectToLogin(router);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      redirectToLogin(router);
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
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto bg-white border border-red-300 rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-red-600 mb-4">エラーが発生しました</h1>
          <pre className="bg-slate-50 p-4 rounded-lg text-red-700 text-sm border border-red-200">{error}</pre>
          <Link 
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">データが見つかりませんでした</div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/view/${data.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop only */}
      <aside className="hidden sm:flex w-52 bg-white/90 backdrop-blur-sm border-r border-slate-200 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 h-16 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <ChartBarSquareIcon className="h-5 w-5" />
            ダッシュボード
          </Link>

          <Link
            href={`/lp/${lpId}/edit`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <PencilSquareIcon className="h-5 w-5" />
            LP編集
          </Link>

          <Link
            href={`/lp/${lpId}/analytics-simple`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-white bg-blue-600 transition-colors text-sm font-semibold"
          >
            <PresentationChartLineIcon className="h-5 w-5" />
            LP分析
          </Link>

          <Link
            href="/media"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            <PhotoIcon className="h-5 w-5" />
            メディア
          </Link>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              {data.title} - 分析レポート
            </h1>
            <p className="text-xs text-slate-500 truncate">LP ID: {data.lp_id}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="sm:hidden bg-white border-b border-slate-200 p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 text-sm font-medium"
            >
              <ChartBarSquareIcon className="h-5 w-5" />
              ダッシュボード
            </Link>
            <Link
              href={`/lp/${lpId}/edit`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 text-sm font-medium"
            >
              <PencilSquareIcon className="h-5 w-5" />
              LP編集
            </Link>
            <Link
              href={`/lp/${lpId}/analytics-simple`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-blue-600 text-white text-sm font-semibold"
            >
              <PresentationChartLineIcon className="h-5 w-5" />
              LP分析
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 text-sm font-medium"
            >
              ログアウト
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <EyeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {Number(data.total_views || 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-600">総閲覧数</div>
                <div className="text-xs text-slate-400 mt-1">Total Views</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {Number(data.total_sessions || 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-600">セッション数</div>
                <div className="text-xs text-slate-400 mt-1">Unique Sessions</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <CursorArrowRaysIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {Number(data.total_cta_clicks || 0).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-600">CTAクリック</div>
                <div className="text-xs text-slate-400 mt-1">CTA Clicks</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ChartBarSquareIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {typeof data.cta_conversion_rate === 'number' ? data.cta_conversion_rate.toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm font-medium text-slate-600">転換率</div>
                <div className="text-xs text-slate-400 mt-1">Conversion Rate</div>
              </div>
            </section>

            {/* Step Funnel */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <PresentationChartLineIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">ステップファネル分析</h2>
              </div>
              {data.step_funnel && data.step_funnel.length > 0 ? (
                <div className="space-y-4">
                  {data.step_funnel.map((step: any, index: number) => {
                    const base = data.step_funnel[0]?.step_views || 1;
                    const views = Number(step.step_views || 0);
                    const width = Math.min(100, Math.max(4, (views / base) * 100));
                    const convRate = Math.min(100, Math.max(0, Number(step.conversion_rate || 0)));
                    
                    return (
                      <div key={step.step_id || index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold">
                              {step.step_order + 1}
                            </span>
                            <span className="font-medium text-slate-900">ステップ {step.step_order + 1}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-500">閲覧: <span className="text-blue-600 font-semibold">{step.step_views}</span></span>
                            <span className="text-slate-500">離脱: <span className="text-orange-600 font-semibold">{step.step_exits}</span></span>
                            <span className="text-emerald-600 font-semibold">{convRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="relative h-8 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-end px-3 transition-all duration-500"
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
                <div className="text-center py-12 text-slate-500 text-sm">
                  ステップファネルデータがありません
                </div>
              )}
            </section>

            {/* CTA Analysis */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <CursorArrowRaysIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">CTA別クリック分析</h2>
              </div>
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
                          <span className="font-medium text-slate-900">{label} {cta.cta_type ? `(${cta.cta_type})` : ''}</span>
                          <span className="text-emerald-600 font-semibold">{clicks} クリック</span>
                        </div>
                        <div className="relative h-6 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  CTAクリックデータがありません
                </div>
              )}
            </section>

            {/* Public URL */}
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">公開URL</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      alert('URLをコピーしました');
                    }}
                    className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    コピー
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors text-center"
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
