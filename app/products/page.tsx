'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProducts();
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
              SwipeLaunch
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                ダッシュボード
              </Link>
              <Link href="/products" className="text-white font-semibold">
                商品管理
              </Link>
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                <span className="text-gray-300">
                  {user?.username || 'ユーザー'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">商品管理</h1>
          <p className="text-gray-400">LPに紐付ける商品を管理します</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-3xl font-bold text-white mb-4">準備中</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              商品管理機能は現在開発中です。<br />
              近日中にご利用いただけるようになります。
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>

        {/* Preview of Future Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-white font-semibold mb-2">商品登録</h3>
            <p className="text-gray-400 text-sm">
              商品情報、価格、在庫を登録
            </p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-white font-semibold mb-2">LP連携</h3>
            <p className="text-gray-400 text-sm">
              作成したLPに商品を紐付け
            </p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-semibold mb-2">売上管理</h3>
            <p className="text-gray-400 text-sm">
              商品ごとの売上と在庫を確認
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
