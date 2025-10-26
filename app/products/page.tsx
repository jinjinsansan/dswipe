'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { lpApi } from '@/lib/api';
import { enrichLpsWithHeroMedia, resolveSellerUsername } from '@/lib/lpPreview';
import type { HeroMedia } from '@/lib/lpPreview';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CurrencyYenIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  DocumentIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log('ProductsContent レンダリング');
  console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'price_low' | 'price_high'>('latest');
  const [sellerFilter, setSellerFilter] = useState('');
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // URLパラメータからsellerを取得
    const seller = searchParams.get('seller');
    if (seller) {
      setSellerFilter(seller);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchQuery, priceRange, sortBy, sellerFilter]);

  const fetchProducts = async () => {
    console.log('/products ページ - 公開LP取得開始');
    try {
      setIsLoading(true);
      console.log('API呼び出し: lpApi.list');
      // 公開されているLPを取得
      const response = await lpApi.list();
      console.log('API レスポンス取得成功');
      console.log('response.data:', response.data);
      
      // バックエンドのレスポンス構造に合わせる
      const allLPs = response.data?.data || response.data || [];
      
      // 公開されているLPのみをフィルタリング
      const publishedLPs = allLPs.filter((lp: any) => lp.status === 'published');
      
      console.log('全LP数:', allLPs.length);
      console.log('公開LP数:', publishedLPs.length);
      console.log('公開LPデータ:', publishedLPs);
      
      // 最初のLPのstepsを確認
      if (publishedLPs.length > 0) {
        const firstLP: any = publishedLPs[0];
        console.log('最初のLPの構造:', firstLP);
        console.log('user_id:', firstLP.user_id);
        console.log('owner:', firstLP.owner);
        console.log('user:', firstLP.user);
        console.log('username:', firstLP.username);
        console.log('steps:', firstLP.steps);
      }
      
      const enrichedLPs = await enrichLpsWithHeroMedia(publishedLPs);
      setProducts(enrichedLPs);
    } catch (error: any) {
      console.error('商品の取得に失敗:', error);
      console.error('エラー詳細:', error.response?.data || error.message);
      console.error('エラースタック:', error.stack);
    } finally {
      setIsLoading(false);
      console.log('商品取得完了');
    }
  };

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

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 販売者フィルター
    if (sellerFilter) {
      const normalizedFilter = sellerFilter.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const sellerName = resolveSellerUsername(p);
        return sellerName ? sellerName.toLowerCase().includes(normalizedFilter) : false;
      });
    }

    // 価格帯フィルター
    if (priceRange !== 'all') {
      filtered = filtered.filter((p) => {
        const price = p.price_in_points || 0;
        if (priceRange === 'low') return price < 10000;
        if (priceRange === 'mid') return price >= 10000 && price < 50000;
        if (priceRange === 'high') return price >= 50000;
        return true;
      });
    }

    // ソート
    filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'popular') {
        return (b.total_sales || 0) - (a.total_sales || 0);
      }
      if (sortBy === 'price_low') {
        return (a.price_in_points || 0) - (b.price_in_points || 0);
      }
      if (sortBy === 'price_high') {
        return (b.price_in_points || 0) - (a.price_in_points || 0);
      }
      return 0;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // フィルター変更時は1ページ目に戻る
  };

  // ページネーション計算
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                ダッシュボード
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
                <BuildingStorefrontIcon className="h-4 w-4" aria-hidden="true" />
                マーケット
              </div>
            </div>
            <div className="text-sm text-slate-500">
              {filteredProducts.length} 件のLPを表示
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                検索
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品名・説明で検索"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <CurrencyYenIcon className="h-4 w-4" aria-hidden="true" />
                価格帯
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="low">〜10,000 P</option>
                <option value="mid">10,000〜50,000 P</option>
                <option value="high">50,000 P〜</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                並び替え
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="latest">新着順</option>
                <option value="popular">人気順</option>
                <option value="price_low">価格が安い順</option>
                <option value="price_high">価格が高い順</option>
              </select>
            </div>

            {/* Seller Filter */}
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-2 flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
                販売者
              </label>
              <input
                type="text"
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                placeholder="販売者名で絞り込み"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {sellerFilter && (
                <button
                  onClick={() => setSellerFilter('')}
                  className="text-blue-600 hover:text-blue-500 text-xs mt-1"
                >
                  クリア
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <DocumentIcon className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-slate-600 text-lg">該当するLPが見つかりませんでした</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPriceRange('all');
                setSellerFilter('');
              }}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {currentProducts.map((lp) => {
                const heroMedia = getHeroMedia(lp);
                const sellerUsername = resolveSellerUsername(lp);

                return (
                  <Link
                    key={lp.id}
                    href={`/view/${lp.slug}`}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all overflow-hidden group block shadow-sm"
                  >
                    {/* LP Preview Image */}
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden relative">
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
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center p-4 text-slate-600">
                            <DocumentIcon className="h-10 w-10 mx-auto mb-2" aria-hidden="true" />
                            <div className="text-sm font-semibold line-clamp-2">{lp.title}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LP Info */}
                    <div className="p-4">
                      {/* Seller Info */}
                      {sellerUsername && (
                        <Link
                          href={`/u/${sellerUsername}`}
                          className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                            {sellerUsername.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-blue-600 hover:text-blue-500 text-xs">
                            {sellerUsername}
                          </span>
                        </Link>
                      )}

                      <h3 className="text-slate-900 font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                        {lp.title}
                      </h3>

                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          {lp.total_views || 0} 閲覧
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            lp.status === 'published'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {lp.status === 'published' ? '公開中' : '下書き'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  ← 前へ
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  次へ →
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-4 text-slate-500 text-sm">
              {filteredProducts.length} 件のLP中 {startIndex + 1}〜{Math.min(endIndex, filteredProducts.length)} 件を表示
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductsContent />
    </Suspense>
  );
}
