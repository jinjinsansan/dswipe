'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CurrencyYenIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  DocumentIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

function ProductsContent() {
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
    console.log('/products ページ - 公開商品取得開始');
    try {
      setIsLoading(true);
      console.log('API呼び出し: productApi.getPublic');
      const response = await productApi.getPublic({ sort: 'latest', limit: 50 });
      console.log('API レスポンス取得成功');
      console.log('response.data:', response.data);

      const publicProducts = response.data?.data || [];
      console.log('取得商品数:', publicProducts.length);

      setProducts(publicProducts);
    } catch (error: any) {
      console.error('商品の取得に失敗:', error);
      console.error('エラー詳細:', error.response?.data || error.message);
      console.error('エラースタック:', error.stack);
    } finally {
      setIsLoading(false);
      console.log('商品取得完了');
    }
  };

  const getThumbnailUrl = (product: any): string | null => {
    const candidates = [
      product.lp_thumbnail_url,
      product.hero_image_url,
      product.heroImage, // 後方互換性のため
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

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          (typeof p.title === 'string' && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (typeof p.description === 'string' && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 販売者フィルター
    if (sellerFilter) {
      const normalizedFilter = sellerFilter.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const sellerName = typeof p.seller_username === 'string' ? p.seller_username : '';
        return sellerName.toLowerCase().includes(normalizedFilter);
      });
    }

    // 価格帯フィルター
    if (priceRange !== 'all') {
      filtered = filtered.filter((p) => {
        const price = Number(p.price_in_points) || 0;
        if (priceRange === 'low') return price < 10000;
        if (priceRange === 'mid') return price >= 10000 && price < 50000;
        if (priceRange === 'high') return price >= 50000;
        return true;
      });
    }

    // ソート
    filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'popular') {
        return (b.total_sales || 0) - (a.total_sales || 0);
      }
      if (sortBy === 'price_low') {
        return (Number(a.price_in_points) || 0) - (Number(b.price_in_points) || 0);
      }
      if (sortBy === 'price_high') {
        return (Number(b.price_in_points) || 0) - (Number(a.price_in_points) || 0);
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
    <DashboardLayout pageTitle="商品マーケット" pageSubtitle={`${filteredProducts.length} 件のLPを表示`} requireAuth={false}>
      <div className="max-w-7xl mx-auto px-4 pb-16 pt-6 sm:px-6 lg:px-8">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 mb-8">
              {currentProducts.map((product) => {
                const sellerUsername = typeof product.seller_username === 'string' ? product.seller_username : '';
                const thumbnailUrl = getThumbnailUrl(product);
                const lpSlug = typeof product.lp_slug === 'string' ? product.lp_slug : undefined;
                const targetHref = lpSlug ? `/view/${lpSlug}` : `/products/${product.id}`;
                const priceLabel = product.allow_point_purchase
                  ? `${(Number(product.price_in_points) || 0).toLocaleString()} pt`
                  : product.allow_jpy_purchase
                    ? `${(Number(product.price_jpy) || 0).toLocaleString()} 円`
                    : '価格未設定';

                return (
                  <Link
                    key={product.id}
                    href={targetHref}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0 hover:border-blue-300 hover:shadow-md md:flex-col md:items-stretch md:overflow-hidden md:gap-0 md:p-0"
                  >
                    <div className="relative h-20 w-24 flex-none overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 md:h-auto md:w-full md:rounded-none md:rounded-t-xl md:aspect-[3/2]">
                      {thumbnailUrl ? (
                        isVideoUrl(thumbnailUrl) ? (
                          <video
                            src={thumbnailUrl}
                            className="absolute inset-0 h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={thumbnailUrl}
                            alt={product.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-4 text-slate-600">
                            <DocumentIcon className="h-10 w-10 mx-auto mb-2" aria-hidden="true" />
                            <div className="text-xs font-semibold line-clamp-2 md:text-sm">{product.title}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-2 py-1 md:px-4 md:py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 md:text-xs">
                          {product.is_featured ? (
                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white md:text-[11px]">
                              人気
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide md:text-[11px] ${
                              product.is_available
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {product.is_available ? '販売中' : '停止中'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 md:text-[11px]">
                            <ShoppingBagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {(product.total_sales || 0).toLocaleString()} 件
                          </span>
                          {product.created_at ? (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 md:text-[11px]">
                              {new Date(product.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 md:text-base">
                          {product.title}
                        </h3>

                        <p className="line-clamp-2 text-xs text-slate-600 md:text-sm">
                          {product.description || '詳細情報は商品ページをご確認ください。'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 md:text-xs">
                        <span className="font-medium text-slate-500">@{sellerUsername || 'unknown'}</span>
                        <span className="font-semibold text-emerald-600">
                          {priceLabel}
                        </span>
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
    </DashboardLayout>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductsContent />
    </Suspense>
  );
}
