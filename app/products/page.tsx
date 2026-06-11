'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPublicProducts } from '@/lib/publicClient';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  DocumentIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

/* Momentum marketplace — mock: design_handoff_dswipe/D-Swipe Marketplace.html */

import { GRAD_BRAND, HEAD_BG, NAVY_CARD_BG, pickAvatarGradient, pickThumbFallback } from '@/lib/momentum';

const PRICE_RANGES = [
  { key: 'all', label: 'すべて' },
  { key: 'low', label: '〜10,000 P' },
  { key: 'mid', label: '10,000〜50,000 P' },
  { key: 'high', label: '50,000 P〜' },
] as const;

const SORTS = [
  { key: 'latest', label: '新着', icon: ClockIcon },
  { key: 'popular', label: '売れ筋', icon: FireIcon },
  { key: 'price_low', label: '価格が安い順', icon: ArrowTrendingDownIcon },
  { key: 'price_high', label: '価格が高い順', icon: ArrowTrendingUpIcon },
] as const;

function ProductsContent() {
  const searchParams = useSearchParams();

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
    try {
      setIsLoading(true);
      const response = await fetchPublicProducts({ sort: 'latest', limit: 50 });
      const payload = response?.data ?? response;

      const publicProducts = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload)
        ? payload
        : [];

      setProducts(publicProducts);
    } catch (error: any) {
      console.error('商品の取得に失敗:', error);
    } finally {
      setIsLoading(false);
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
          (typeof p.description === 'string' && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (typeof p.seller_username === 'string' && p.seller_username.toLowerCase().includes(searchQuery.toLowerCase()))
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

    // 価格帯フィルター（ポイント建ての商品のみ対象。円建て/未設定は「すべて」でのみ表示）
    if (priceRange !== 'all') {
      filtered = filtered.filter((p) => {
        if (!p.allow_point_purchase) return false;
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

  // 価格帯ごとの件数（サイドバー用・ポイント建ての商品のみ）
  const priceRangeCounts = useMemo(() => {
    const counts = { all: products.length, low: 0, mid: 0, high: 0 };
    products.forEach((p) => {
      if (!p.allow_point_purchase) return;
      const price = Number(p.price_in_points) || 0;
      if (price < 10000) counts.low += 1;
      else if (price < 50000) counts.mid += 1;
      else counts.high += 1;
    });
    return counts;
  }, [products]);

  // 売れ筋クリエイター（販売数合計の上位3名）
  const topSellers = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const name = typeof p.seller_username === 'string' && p.seller_username ? p.seller_username : '';
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + (Number(p.total_sales) || 0));
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, sales]) => ({ name, sales }));
  }, [products]);

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
    <DashboardLayout pageTitle="マーケット" pageSubtitle={`${filteredProducts.length} 件のLPを表示`} requireAuth={false}>
      <div className="max-w-7xl mx-auto px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Navy hero head */}
        <div className="rounded-3xl px-6 py-7 sm:px-9 sm:py-9 mb-7 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]" style={{ background: HEAD_BG }}>
          <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-pure-white">マーケット</h1>
          <p className="text-[14.5px] text-[#bcd3ee] mt-2.5">
            クリエイターのノウハウ・テンプレート・講座を、ポイントで購入。気になる商品を探そう。
          </p>
          <div className="relative max-w-[560px] mt-5">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-[19px] h-[19px] text-slate-500" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="商品名・説明・販売者で検索"
              className="w-full text-[15px] text-slate-900 placeholder-slate-400 bg-white border-0 rounded-[14px] py-3.5 pl-[46px] pr-4 shadow-lg focus:outline-none focus:ring-[3px] focus:ring-cyan-400/40"
            />
          </div>
          <div className="flex gap-2 mt-[18px] flex-wrap">
            {PRICE_RANGES.map((range) => {
              const active = priceRange === range.key;
              return (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setPriceRange(range.key)}
                  className={`text-[13px] font-semibold rounded-full px-3.5 py-[7px] border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#0b1f3a] border-white'
                      : 'text-[#cfe3f5] bg-white/[0.08] border-white/[0.16] hover:bg-white/[0.16]'
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
            {sellerFilter && (
              <button
                type="button"
                onClick={() => setSellerFilter('')}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-3.5 py-[7px] bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/25 transition-colors"
              >
                @{sellerFilter}
                <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_304px] gap-8 items-start">
          <main>
            {/* Sort pills */}
            <div className="flex gap-1 mb-[18px] items-center flex-wrap">
              {SORTS.map((sort) => {
                const active = sortBy === sort.key;
                return (
                  <button
                    key={sort.key}
                    type="button"
                    onClick={() => setSortBy(sort.key)}
                    className={`inline-flex items-center gap-1.5 text-[13.5px] font-bold rounded-[10px] px-3.5 py-2 transition-colors ${
                      active ? 'text-sky-600 bg-[#e9f6fe]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <sort.icon className="w-[15px] h-[15px]" aria-hidden="true" />
                    {sort.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[12.5px] text-slate-500">
                <b className="text-[#0b1f3a]">{filteredProducts.length}</b> 件
              </span>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#e2ebf6] rounded-2xl shadow-sm">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f6fe] text-sky-600">
                  <DocumentIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="text-slate-600 text-lg">該当するLPが見つかりませんでした</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange('all');
                    setSellerFilter('');
                  }}
                  className="mt-6 px-5 py-2.5 text-sm font-bold text-pure-white rounded-xl shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)] transition-shadow"
                  style={{ background: GRAD_BRAND }}
                >
                  フィルターをリセット
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8">
                  {currentProducts.map((product) => {
                    const sellerUsername = typeof product.seller_username === 'string' ? product.seller_username : '';
                    const thumbnailUrl = getThumbnailUrl(product);
                    const lpSlug = typeof product.lp_slug === 'string' ? product.lp_slug : undefined;
                    const targetHref = lpSlug ? `/view/${lpSlug}` : `/products/${product.id}`;
                    const priceLabel = product.allow_point_purchase
                      ? `${(Number(product.price_in_points) || 0).toLocaleString()}`
                      : product.allow_jpy_purchase
                        ? `${(Number(product.price_jpy) || 0).toLocaleString()}`
                        : null;
                    const priceUnit = product.allow_point_purchase ? ' P' : product.allow_jpy_purchase ? ' 円' : '';
                    const idSeed = String(product.id ?? product.title ?? '');
                    const fallbackBg = pickThumbFallback(idSeed);
                    const avatarBg = pickAvatarGradient(sellerUsername || idSeed);

                    return (
                      <article
                        key={product.id}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-[#e2ebf6] bg-white shadow-sm transition-all hover:-translate-y-[3px] hover:border-[#bfe6fb] hover:shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]"
                      >
                        <Link href={targetHref} className="block relative h-[130px] overflow-hidden" style={{ background: fallbackBg }}>
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
                            <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
                              <span className="text-pure-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">{product.title}</span>
                            </div>
                          )}
                          <span
                            className={`absolute top-2.5 left-2.5 text-[10.5px] font-bold text-pure-white backdrop-blur-[4px] px-2.5 py-[3px] rounded-full ${
                              product.is_available ? 'bg-[rgba(11,31,58,.5)]' : 'bg-[rgba(71,85,105,.65)]'
                            }`}
                          >
                            {product.is_available ? '販売中' : '停止中'}
                          </span>
                          {product.is_featured ? (
                            <span className="absolute top-2.5 right-2.5 text-[10.5px] font-extrabold text-pure-white px-2.5 py-[3px] rounded-full" style={{ background: GRAD_BRAND }}>
                              人気
                            </span>
                          ) : null}
                        </Link>

                        <div className="flex flex-1 flex-col gap-2 px-[15px] pt-3.5 pb-[15px]">
                          <Link href={targetHref} className="text-[14.5px] font-bold text-[#0b1f3a] leading-snug line-clamp-2 hover:text-sky-600 transition-colors">
                            {product.title}
                          </Link>

                          {sellerUsername ? (
                            <Link href={`/u/${sellerUsername}`} className="flex items-center gap-[7px] group/seller">
                              <span
                                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#042032] flex-shrink-0"
                                style={{ background: avatarBg }}
                              >
                                {sellerUsername.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-600 font-semibold group-hover/seller:text-sky-600 transition-colors">@{sellerUsername}</span>
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-600 font-semibold">@unknown</span>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-1.5">
                            {priceLabel ? (
                              <span className="text-lg font-extrabold text-sky-600 tabular-nums">
                                {priceLabel}
                                <small className="text-xs">{priceUnit}</small>
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-600">価格未設定</span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-500">
                              <ShoppingBagIcon className="w-[13px] h-[13px] text-amber-500" aria-hidden="true" />
                              {(product.total_sales || 0).toLocaleString()}件
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white border border-[#e2ebf6] text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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
                                ? 'text-pure-white shadow-sm'
                                : 'bg-white text-slate-600 border border-[#e2ebf6] hover:border-[#bfe6fb] hover:text-sky-600'
                            }`}
                            style={currentPage === pageNum ? { background: GRAD_BRAND } : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-white border border-[#e2ebf6] text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-[#e2ebf6] rounded-2xl p-[18px] shadow-sm mb-[18px]">
              <h3 className="flex items-center gap-[7px] text-[13px] font-bold text-[#0b1f3a] mb-3.5">
                <TagIcon className="w-4 h-4 text-sky-600" aria-hidden="true" />
                価格帯で探す
              </h3>
              {PRICE_RANGES.filter((r) => r.key !== 'all').map((range, i) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => {
                    setPriceRange(range.key);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center justify-between w-full py-2 text-[13.5px] text-left transition-colors hover:text-sky-600 ${
                    i > 0 ? 'border-t border-[#eef3f9]' : ''
                  } ${priceRange === range.key ? 'text-sky-600 font-bold' : 'text-slate-700'}`}
                >
                  {range.label}
                  <span className="text-xs text-slate-500 tabular-nums">{priceRangeCounts[range.key]}</span>
                </button>
              ))}
            </div>

            {topSellers.length > 0 && (
              <div className="bg-white border border-[#e2ebf6] rounded-2xl p-[18px] shadow-sm mb-[18px]">
                <h3 className="flex items-center gap-[7px] text-[13px] font-bold text-[#0b1f3a] mb-3.5">
                  <UsersIcon className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  売れ筋クリエイター
                </h3>
                {topSellers.map((seller, i) => (
                  <Link
                    key={seller.name}
                    href={`/u/${seller.name}`}
                    className={`flex items-center gap-[11px] py-2 group ${i > 0 ? 'border-t border-[#eef3f9]' : ''}`}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm text-[#042032] flex-shrink-0"
                      style={{ background: pickAvatarGradient(seller.name) }}
                    >
                      {seller.name.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-[#0b1f3a] group-hover:text-sky-600 transition-colors">@{seller.name}</span>
                      <span className="block text-[11.5px] text-slate-500">{seller.sales.toLocaleString()}件販売</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-5 shadow-[0_22px_44px_-24px_rgba(2,132,199,.34)]" style={{ background: NAVY_CARD_BG }}>
              <b className="block text-base font-extrabold text-pure-white">あなたも販売する</b>
              <p className="text-[12.5px] text-[#bcd3ee] mt-2 mb-4 leading-relaxed">
                作ったLPやノウハウを商品化。ポイント決済で受け取れます。
              </p>
              <Link
                href="/lp/create"
                className="inline-flex items-center justify-center gap-2 w-full text-[13px] font-bold text-pure-white rounded-xl px-4 py-2.5 shadow-[0_10px_26px_-8px_rgba(6,182,212,.55)] hover:shadow-[0_18px_48px_-12px_rgba(6,182,212,.5)] transition-shadow"
                style={{ background: GRAD_BRAND }}
              >
                販売者になる
                <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
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
