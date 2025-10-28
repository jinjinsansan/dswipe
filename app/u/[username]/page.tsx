'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productApi, publicApi } from '@/lib/api';
import { DocumentIcon, ChatBubbleLeftRightIcon, LinkIcon } from '@heroicons/react/24/outline';
import type { PublicNoteSummary, PublicUserProfile } from '@/types';
import StickySiteHeader from '@/components/layout/StickySiteHeader';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  console.log('UserProfilePage レンダリング - ユーザー名:', username);

  const [products, setProducts] = useState<any[]>([]);
  const [notes, setNotes] = useState<PublicNoteSummary[]>([]);
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalNotes: 0,
  });

  const getThumbnailUrl = (product: any): string | null => {
    const candidates = [
      product.lp_thumbnail_url,
      product.hero_image_url,
      product.meta_image_url,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0 && candidate.trim() !== '/placeholder.jpg') {
        return candidate.trim();
      }
    }

    return null;
  };

  const isVideoUrl = (url: string | null): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  useEffect(() => {
    console.log('useEffect 実行 - fetchUserData を呼び出します');
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [productsResponse, profileResponse, notesResponse] = await Promise.all([
        productApi.getPublic({
          seller_username: username,
          sort: 'latest',
          limit: 50,
        }),
        publicApi.getUserProfile(username),
        publicApi.listNotes({ limit: 100, author_username: username }),
      ]);

      const userProducts = productsResponse.data?.data || [];
      const userNotes = (notesResponse.data?.data || []).filter((note: PublicNoteSummary) => note.author_username === username);

      setProducts(userProducts);
      setNotes(userNotes);
      setStats({
        totalProducts: userProducts.length,
        totalSales: userProducts.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0),
        totalNotes: userNotes.length,
      });

      setProfile(profileResponse.data as PublicUserProfile);
    } catch (error: any) {
      console.error('Failed to fetch user products:', error);
      const status = error.response?.status;
      if (status === 404) {
        setError('このユーザーのプロフィールが見つかりませんでした');
      } else {
        setError(error.response?.data?.detail || error.message || 'プロフィール情報の取得に失敗しました');
      }
      setProfile(null);
      setProducts([]);
      setNotes([]);
      setStats({ totalProducts: 0, totalSales: 0, totalNotes: 0 });
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
            onClick={() => fetchUserData()}
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
      <StickySiteHeader showDashboardLink />
      {/* Header */}
      <header className="sticky top-16 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={`${username}のプロフィール画像`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl sm:text-4xl">
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{username}</h1>
              {profile?.bio && (
                <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto sm:mx-0 mb-4 whitespace-pre-line">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-900">{stats.totalProducts}</span>
                  <span className="text-slate-500 ml-1">販売中商品</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-green-600">{stats.totalSales.toLocaleString()}</span>
                  <span className="text-slate-500 ml-1">総販売数</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-amber-600">{stats.totalNotes}</span>
                  <span className="text-slate-500 ml-1">公開NOTE</span>
                </div>
              </div>

              {(profile?.sns_url || profile?.line_url) && (
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                  {profile?.sns_url && (
                    <a
                      href={profile.sns_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 text-sm font-semibold transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                      SNSを見る
                    </a>
                  )}
                  {profile?.line_url && (
                    <a
                      href={profile.line_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06C755] text-white text-sm font-semibold hover:bg-[#05B34A] transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" aria-hidden="true" />
                      LINEで友だち追加
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">販売中の商品</h2>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-lg mb-4">まだ販売中の商品がありません</p>
            <p className="text-slate-500 text-sm">ユーザー名: {username}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
              const thumbnailUrl = getThumbnailUrl(product);
              const lpSlug = typeof product.lp_slug === 'string' ? product.lp_slug : undefined;
              const targetHref = lpSlug ? `/view/${lpSlug}` : `/products/${product.id}`;

              return (
                <Link
                  key={product.id}
                  href={targetHref}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all overflow-hidden group shadow-sm"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    {thumbnailUrl ? (
                      isVideoUrl(thumbnailUrl) ? (
                        <video
                          src={thumbnailUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={thumbnailUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <DocumentIcon className="h-10 w-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-slate-900 font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    {product.description && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-slate-600 font-semibold">
                        {product.price_in_points?.toLocaleString()} P
                      </span>
                      <span className="text-slate-500">
                        {(product.total_sales || 0).toLocaleString()} 件販売
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

      {/* Notes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">公開されたNOTE</h2>

        {notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-lg mb-3">公開NOTEはまだありません</p>
            <p className="text-slate-500 text-sm">ユーザー名: {username}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  {note.cover_image_url ? (
                    <img
                      src={note.cover_image_url}
                      alt={note.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <DocumentIcon className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 px-5 py-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        note.is_paid ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {note.is_paid ? '有料' : '無料'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {note.published_at ? new Date(note.published_at).toLocaleDateString('ja-JP') : '未公開'}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{note.title}</h3>
                  {note.excerpt ? (
                    <p className="line-clamp-3 text-sm text-slate-600">{note.excerpt}</p>
                  ) : (
                    <p className="text-sm text-slate-500">概要未設定の記事です。</p>
                  )}
                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {note.is_paid ? `${note.price_points.toLocaleString()} P` : 'FREE'}
                    </span>
                    <span className="truncate">
                      @{note.author_username ?? username}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
