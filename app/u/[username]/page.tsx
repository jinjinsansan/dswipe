'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi } from '@/lib/api';
import { enrichLpsWithHeroMedia, resolveSellerUsername } from '@/lib/lpPreview';
import type { HeroMedia } from '@/lib/lpPreview';
import { DocumentIcon } from '@heroicons/react/24/outline';

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
    console.log('fetchUserLps 開始');
    try {
      setIsLoading(true);
      setError('');

      console.log('API呼び出し: lpApi.list');
      const response = await lpApi.list();

      console.log('API レスポンス取得成功');
      const allLps = response.data?.data || response.data || [];
      console.log('全LPデータ:', allLps);

      const publishedLps = allLps.filter((lp: any) => lp.status === 'published');
      const enriched = await enrichLpsWithHeroMedia(publishedLps);
      const userLps = enriched.filter((lp: any) => resolveSellerUsername(lp) === username);

      console.log('ユーザー公開LP数:', userLps.length);

      setLandingPages(userLps);
      setStats({
        totalPublished: userLps.length,
        totalViews: userLps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0),
      });
    } catch (error: any) {
      console.error('❌ LPの取得に失敗:', error);
      console.error('❌ エラー詳細:', error.response?.data || error.message);
      setError(error.message || 'LPの取得に失敗しました');
    } finally {
      console.log('fetchUserLps 完了');
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
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← ダッシュボードに戻る
            </Link>
            <Link href="/products" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              全商品を見る →
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-3xl sm:text-4xl">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{username}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="text-gray-300">
                  <span className="font-semibold text-white">{stats.totalPublished}</span>
                  <span className="text-gray-400 ml-1">公開LP</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-semibold text-green-400">{stats.totalViews.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">総閲覧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LP Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">公開中のLP</h2>

        {landingPages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">まだ公開LPがありません</p>
            <p className="text-gray-500 text-sm">ユーザー名: {username}</p>
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
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-all overflow-hidden group"
                >
                  <div className="aspect-video bg-gray-900 overflow-hidden">
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
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <DocumentIcon className="h-10 w-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-white font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                      {lp.title}
                    </h3>
                    {summary && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-blue-400 font-semibold">
                        閲覧 {(lp.total_views || 0).toLocaleString()}
                      </span>
                      <span className="text-gray-400">
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
