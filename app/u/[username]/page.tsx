'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    fetchUserProducts();
  }, [username]);

  const fetchUserProducts = async () => {
    try {
      setIsLoading(true);
      // 全商品を取得してフィルター（後でバックエンドAPIを改善）
      const response = await productApi.getPublic({ limit: 100 });
      const userProducts = response.data.filter(
        (p: any) => p.seller_username === username
      );
      
      setProducts(userProducts);
      setStats({
        totalProducts: userProducts.length,
        activeProducts: userProducts.filter((p: any) => p.stock > 0).length,
      });
    } catch (error) {
      console.error('商品の取得に失敗:', error);
    } finally {
      setIsLoading(false);
    }
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
                  <span className="font-semibold text-white">{stats.totalProducts}</span>
                  <span className="text-gray-400 ml-1">商品</span>
                </div>
                <div className="text-gray-300">
                  <span className="font-semibold text-green-400">{stats.activeProducts}</span>
                  <span className="text-gray-400 ml-1">販売中</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">販売中の商品</h2>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">まだ商品がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
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
                      在庫: {product.stock}
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
        )}
      </div>
    </div>
  );
}
