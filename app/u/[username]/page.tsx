'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi } from '@/lib/api';
import { enrichLpsWithHeroMedia, resolveSellerUsername } from '@/lib/lpPreview';
import type { HeroMedia } from '@/lib/lpPreview';
import { DocumentIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  console.log('UserProfilePage レンダリング - ユーザー名:', username);

  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalPublished: 0,
    totalViews: 0,
  });

  const getHeroMedia = (lp: any): HeroMedia | null => {
    const media = lp.heroMedia;
    if (media && typeof media === 'object' && 'type' in media && 'url' in media) {
      return media as HeroMedia;
    }
    if (lp.heroImage) {
      return { type: 'image', url: lp.heroImage };
    }
    if (lp.image_url) {
      return { type: 'image', url: lp.image_url };
    }
    if (lp.heroVideo) {
      return { type: 'video', url: lp.heroVideo };
    }
    return null;
  };

  useEffect(() => {
    console.log('useEffect 実行 - fetchUserLps を呼び出します');
    fetchUserLps();
  }, [username]);

  const fetchUserLps = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await lpApi.list();
      const allLps = response.data?.data || response.data || [];
      const publishedLps = allLps.filter((lp: any) => lp.status === 'published');
      const enriched = await enrichLpsWithHeroMedia(publishedLps);
      const userLps = enriched.filter((lp: any) => resolveSellerUsername(lp) === username);

      setLandingPages(userLps);
      setStats({
        totalPublished: userLps.length,
        totalViews: userLps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0),
      });
    } catch (error: any) {
      console.error('Failed to fetch user LPs:', error);
      setError(error.message || 'LPの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">エラーが発生しました</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchUserLps()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold">
              ← ダッシュボードに戻る
            </Link>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold">
              全商品を見る →
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-3xl sm:text-4xl">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{username}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-900">{stats.totalPublished}</span>
                  <span className="text-slate-500 ml-1">公開LP</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-green-600">{stats.totalViews.toLocaleString()}</span>
                  <span className="text-slate-500 ml-1">総閲覧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LP Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">公開中のLP</h2>

        {landingPages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-lg mb-4">まだ公開LPがありません</p>
            <p className="text-slate-500 text-sm">ユーザー名: {username}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {landingPages.map((lp) => {
              const heroMedia = getHeroMedia(lp);
              const summary = lp.subtitle || lp.description || lp.summary || '';

              return (
                <Link
                  key={lp.id}
                  href={`/view/${lp.slug}`}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all overflow-hidden group shadow-sm"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    {heroMedia?.type === 'image' ? (
                      <img
                        src={heroMedia.url}
                        alt={lp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : heroMedia?.type === 'video' ? (
                      <video
                        src={heroMedia.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <DocumentIcon className="h-10 w-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-slate-900 font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                      {lp.title}
                    </h3>
                    {summary && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-slate-600 font-semibold flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                        {(lp.total_views || 0).toLocaleString()} 閲覧
                      </span>
                      <span className="text-slate-500">
                        {lp.created_at ? new Date(lp.created_at).toLocaleDateString('ja-JP') : ''}
                      </span>
                    </div>

                    <div className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg font-semibold group-hover:bg-blue-700 transition-colors text-sm">
                      LPを見る
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
