'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api';

export default function ProductsPage() {
  const router = useRouter();
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
      const response = await productApi.getPublic({ limit: 1000 });
      setProducts(response.data);
    } catch (error) {
      console.error('商品の取得に失敗:', error);
    } finally {
      setIsLoading(false);
    }
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
      filtered = filtered.filter((p) => p.seller_username === sellerFilter);
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
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                ← ダッシュボード
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white">商品一覧</h1>
            </div>
            <div className="text-gray-400 text-sm">
              {filteredProducts.length} 件の商品
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">🔍 検索</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品名・説明で検索"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">💰 価格帯</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="low">〜10,000 P</option>
                <option value="mid">10,000〜50,000 P</option>
                <option value="high">50,000 P〜</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">📊 並び替え</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="latest">新着順</option>
                <option value="popular">人気順</option>
                <option value="price_low">価格が安い順</option>
                <option value="price_high">価格が高い順</option>
              </select>
            </div>

            {/* Seller Filter */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">👤 販売者</label>
              <input
                type="text"
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                placeholder="販売者名で絞り込み"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
              {sellerFilter && (
                <button
                  onClick={() => setSellerFilter('')}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                >
                  クリア
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">該当する商品が見つかりませんでした</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPriceRange('all');
                setSellerFilter('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-all overflow-hidden group"
                >
                  {/* Product Image */}
                  {product.image_url && (
                    <div className="aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Seller */}
                    <Link
                      href={`/u/${product.seller_username}`}
                      className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                        {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span className="text-blue-400 hover:text-blue-300 text-xs">
                        {product.seller_username}
                      </span>
                    </Link>

                    <h3 className="text-white font-semibold text-base sm:text-lg mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-blue-400 font-bold text-lg">
                        {product.price_in_points?.toLocaleString()} P
                      </span>
                      <span className="text-gray-500 text-sm">
                        🔥 {product.total_sales || 0}件
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
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
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  次へ →
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-4 text-gray-400 text-sm">
              {filteredProducts.length} 件中 {startIndex + 1}〜{Math.min(endIndex, filteredProducts.length)} 件を表示
            </div>
          </>
        )}
      </div>
    </div>
  );
}
