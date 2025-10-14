'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { lpApi, pointsApi, productApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [lps, setLps] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalSales, setTotalSales] = useState<number>(0);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, isInitialized]);

  const fetchData = async () => {
    try {
      const [lpsResponse, pointsResponse, productsResponse] = await Promise.all([
        lpApi.list(),
        pointsApi.getBalance(),
        productApi.list(),
      ]);

      const lpsData = Array.isArray(lpsResponse.data?.data) 
        ? lpsResponse.data.data 
        : Array.isArray(lpsResponse.data) 
        ? lpsResponse.data 
        : [];
      
      const productsData = Array.isArray(productsResponse.data?.data)
        ? productsResponse.data.data
        : Array.isArray(productsResponse.data)
        ? productsResponse.data
        : [];
      
      setLps(lpsData);
      setProducts(productsData);
      setPointBalance(pointsResponse.data.point_balance);
      
      // 総売上計算
      const sales = productsData.reduce((sum: number, p: any) => 
        sum + (p.total_sales || 0) * (p.price_in_points || 0), 0
      );
      setTotalSales(sales);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteLP = async (lpId: string) => {
    if (!confirm('本当にこのLPを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await lpApi.delete(lpId);
      await fetchData();
      alert('LPを削除しました');
    } catch (error: any) {
      console.error('Failed to delete LP:', error);
      alert(error.response?.data?.detail || 'LPの削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            SwipeLaunch
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 text-white bg-blue-600 rounded-lg"
            >
              <span className="text-xl">📊</span>
              <span className="font-semibold">ダッシュボード</span>
            </Link>
            
            <Link
              href="/lp/create"
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <span className="text-xl">➕</span>
              <span>新規LP作成</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <span className="text-xl">📦</span>
              <span>商品管理</span>
            </Link>
            
            <Link
              href="/points/purchase"
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <span className="text-xl">💰</span>
              <span>ポイント購入</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">ポイント残高</span>
            <span className="text-white font-bold">{pointBalance.toLocaleString()} P</span>
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">{user?.username}</div>
              <div className="text-gray-400 text-xs">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ダッシュボード</h1>
            <p className="text-gray-400">ようこそ、{user?.username}さん</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">作成したLP</div>
              <div className="text-3xl font-bold text-white">{lps.length}</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">総閲覧数</div>
              <div className="text-3xl font-bold text-white">
                {lps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">登録商品数</div>
              <div className="text-3xl font-bold text-white">{products.length}</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">総売上</div>
              <div className="text-3xl font-bold text-white">{totalSales.toLocaleString()} P</div>
            </div>
          </div>

          {/* Recently Edited LPs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">最近編集したLP</h2>
              <Link
                href="/lp/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
              >
                + 新規LP作成
              </Link>
            </div>

            {lps.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-white mb-2">LPがありません</h3>
                <p className="text-gray-400 mb-6">最初のLPを作成しましょう</p>
                <Link
                  href="/lp/create"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  新規LP作成
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lps.map((lp: any) => (
                  <div
                    key={lp.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all hover:shadow-xl"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      {lp.steps?.[0]?.image_url ? (
                        <img
                          src={lp.steps[0].image_url}
                          alt={lp.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-6xl">📄</div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {lp.is_published ? (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                            公開中
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full font-semibold">
                            下書き
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-white font-bold mb-2 truncate">{lp.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <span>閲覧数: {lp.total_views || 0}</span>
                        <span>クリック: {lp.total_cta_clicks || 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/lp/${lp.id}/edit`}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center text-sm"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/lp/${lp.id}/analytics`}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center text-sm"
                        >
                          分析
                        </Link>
                        <button
                          onClick={() => handleDeleteLP(lp.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          削除
                        </button>
                      </div>

                      {/* Public URL */}
                      {lp.is_published && lp.slug && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={`${window.location.origin}/view/${lp.slug}`}
                              readOnly
                              className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-400 text-xs"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/view/${lp.slug}`);
                                alert('URLをコピーしました');
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              コピー
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">📊</span>
                <div>
                  <div className="text-gray-400 text-sm">プラン</div>
                  <div className="text-white font-bold">無料プラン</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                LP作成数: 無制限
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">📈</span>
                <div>
                  <div className="text-gray-400 text-sm">登録中のLP数</div>
                  <div className="text-white font-bold">{lps.length}本のLPが登録されています</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                公開中: {lps.filter(lp => lp.is_published).length}本
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">💼</span>
                <div>
                  <div className="text-gray-400 text-sm">販売実績</div>
                  <div className="text-white font-bold">{products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                総売上: {totalSales.toLocaleString()}ポイント
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
