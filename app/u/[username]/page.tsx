'use client';

import { PageLoader } from '@/components/LoadingSpinner';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/lib/api';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  console.log('UserProfilePage レンダリング - ユーザー名:', username);

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    console.log('useEffect 実行 - fetchUserProducts を呼び出します');
    fetchUserProducts();
  }, [username]);

  const fetchUserProducts = async () => {
    console.log('fetchUserProducts 開始');
    try {
      setIsLoading(true);
      setError('');
      
      console.log('API呼び出し: productApi.getPublic');
      // sortパラメータを追加（ダッシュボードと同じ形式）
      // limitは最大50に制限されている
      const response = await productApi.getPublic({ sort: 'latest', limit: 50 });
      
      console.log('API レスポンス取得成功');
      console.log('レスポンス全体:', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data?.data);
      
      // バックエンドのレスポンス構造に合わせる
      const allProducts = response.data?.data || response.data || [];
      console.log('全商品データ:', allProducts);
      console.log('商品数:', allProducts.length);
      console.log('検索中のユーザー名:', username);
      console.log('商品の販売者名リスト:', allProducts.map((p: any) => p.seller_username));
      
      const userProducts = allProducts.filter(
        (p: any) => p.seller_username === username
      );
      
      console.log('フィルター完了');
      console.log('フィルター後の商品数:', userProducts.length);
      console.log('フィルター後の商品:', userProducts);
      
      setProducts(userProducts);
      setStats({
        totalProducts: userProducts.length,
        activeProducts: userProducts.filter((p: any) => p.stock > 0).length,
      });
    } catch (error: any) {
      console.error('❌ 商品の取得に失敗:', error);
      console.error('❌ エラー詳細:', error.response?.data || error.message);
      setError(error.message || '商品の取得に失敗しました');
    } finally {
      console.log('fetchUserProducts 完了');
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
            onClick={() => fetchUserProducts()}
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
            <p className="text-gray-400 text-lg mb-4">まだ商品がありません</p>
            <div className="text-gray-500 text-sm">
              <p>ユーザー名: {username}</p>
              <p className="mt-2">ブラウザの開発者ツール（F12）→ Consoleタブ でデバッグ情報を確認できます</p>
            </div>
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
