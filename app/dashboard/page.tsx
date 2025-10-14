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
      <aside className="w-52 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <Link href="/dashboard" className="text-xl font-light text-white">
            SwipeLaunch
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-light"
            >
              <span className="text-base">📊</span>
              <span>ダッシュボード</span>
            </Link>
            
            <Link
              href="/lp/create"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">➕</span>
              <span>新規LP作成</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">📦</span>
              <span>商品管理</span>
            </Link>
            
            <Link
              href="/points/purchase"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">💰</span>
              <span>ポイント購入</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-gray-400">ポイント残高</span>
            <span className="text-white font-normal">{pointBalance.toLocaleString()} P</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-light truncate">{user?.username}</div>
              <div className="text-gray-400 text-xs">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors text-xs font-light"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-light text-white mb-1">ダッシュボード</h1>
            <p className="text-gray-400 text-sm font-light">ようこそ、{user?.username}さん</p>
          </div>

          {/* Recently Edited LPs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-light text-white">最近編集したLP</h2>
              <Link
                href="/lp/create"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light"
              >
                + 新規LP作成
              </Link>
            </div>

            {lps.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
                <div className="text-5xl mb-3">📄</div>
                <h3 className="text-xl font-light text-white mb-2">LPがありません</h3>
                <p className="text-gray-400 text-sm font-light mb-4">最初のLPを作成しましょう</p>
                <Link
                  href="/lp/create"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-light"
                >
                  新規LP作成
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {lps.map((lp: any) => (
                  <div
                    key={lp.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      {lp.steps?.[0]?.image_url ? (
                        <img
                          src={lp.steps[0].image_url}
                          alt={lp.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-4xl">📄</div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {lp.is_published ? (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] rounded-full font-light">
                            公開中
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-500 text-white text-[10px] rounded-full font-light">
                            下書き
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="text-white font-light text-sm mb-2 truncate">{lp.title}</h3>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mb-3 font-light">
                        <span>閲覧: {lp.total_views || 0}</span>
                        <span>クリック: {lp.total_cta_clicks || 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <Link
                          href={`/lp/${lp.id}/edit`}
                          className="px-2 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-center text-xs font-light"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/lp/${lp.id}/analytics`}
                          className="px-2 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-center text-xs font-light"
                        >
                          分析
                        </Link>
                        <button
                          onClick={() => handleDeleteLP(lp.id)}
                          className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-light"
                        >
                          削除
                        </button>
                      </div>

                      {/* Public URL */}
                      {lp.is_published && lp.slug && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={`${window.location.origin}/view/${lp.slug}`}
                              readOnly
                              className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-400 text-[10px] min-w-0"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/view/${lp.slug}`);
                                alert('URLをコピーしました');
                              }}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-700 transition-colors whitespace-nowrap font-light"
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

          {/* Bottom Info Cards */}
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="text-gray-400 text-xs font-light">ご利用中のプラン</div>
                  <div className="text-white text-sm font-light">無料プラン</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs font-light">
                LP作成数: 無制限
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="text-gray-400 text-xs font-light">登録中のLP数</div>
                  <div className="text-white text-sm font-light">{lps.length}本のLPが登録されています</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs font-light">
                公開中: {lps.filter(lp => lp.is_published).length}本
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">💼</span>
                <div>
                  <div className="text-gray-400 text-xs font-light">販売実績</div>
                  <div className="text-white text-sm font-light">{products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs font-light">
                総売上: {totalSales.toLocaleString()}ポイント
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="text-gray-400 text-xs font-light mb-1">登録商品数</div>
              <div className="text-white text-lg font-light">{products.length}商品</div>
              <div className="text-gray-500 text-xs font-light mt-1">販売中: {products.filter(p => p.is_available).length}商品</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="text-gray-400 text-xs font-light mb-1">今月の売上</div>
              <div className="text-white text-lg font-light">{totalSales.toLocaleString()}P</div>
              <div className="text-gray-500 text-xs font-light mt-1">販売件数: {products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
              <div className="text-gray-400 text-xs font-light mb-1">総閲覧数</div>
              <div className="text-white text-lg font-light">{lps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0)}</div>
              <div className="text-gray-500 text-xs font-light mt-1">CTAクリック: {lps.reduce((sum: number, lp: any) => sum + (lp.total_cta_clicks || 0), 0)}回</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
