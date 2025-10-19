'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { lpApi, pointsApi, productApi } from '@/lib/api';
import DSwipeLogo from '@/components/DSwipeLogo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [lps, setLps] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pointBalance, setPointBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [dashboardType, setDashboardType] = useState<'seller' | 'buyer'>('seller');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);

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

      const heroImageMap = new Map<string, string | null>();

      await Promise.all(
        lpsData.map(async (lpItem) => {
          try {
            const detailResponse = await lpApi.get(lpItem.id);
            const steps = Array.isArray(detailResponse.data?.steps) ? detailResponse.data.steps : [];
            const heroStep = [...steps].find((step: any) => {
              const type = step?.block_type || step?.content_data?.block_type;
              return typeof type === 'string' && type.includes('hero');
            }) || steps.find((step: any) => step?.block_type === 'image-aurora-1') || steps[0];

            const extractImageFromStep = (step: any): string | null => {
              if (!step) return null;
              const sources = [
                step?.content_data?.imageUrl,
                step?.content_data?.image_url,
                step?.content_data?.heroImage,
                step?.content_data?.hero_image,
                step?.content_data?.primaryImageUrl,
                step?.content_data?.primary_image_url,
                step?.image_url,
                step?.imageUrl,
              ];
              return sources.find((value) => typeof value === 'string' && value.trim().length > 0) || null;
            };

            heroImageMap.set(lpItem.id, extractImageFromStep(heroStep));
          } catch (detailError) {
            console.error('Failed to fetch LP detail for hero image:', detailError);
            heroImageMap.set(lpItem.id, null);
          }
        })
      );
      
      const productsData = Array.isArray(productsResponse.data?.data)
        ? productsResponse.data.data
        : Array.isArray(productsResponse.data)
        ? productsResponse.data
        : [];
      
      const enrichedLps = lpsData.map((lpItem: any) => ({
        ...lpItem,
        heroImage: heroImageMap.get(lpItem.id) || lpItem.image_url || null,
      }));

      setLps(enrichedLps);
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

  const fetchBuyerData = async () => {
    try {
      const [historyResponse, popularResponse, latestResponse] = await Promise.all([
        pointsApi.getTransactions({ transaction_type: 'product_purchase', limit: 10 }),
        productApi.getPublic({ sort: 'popular', limit: 5 }),
        productApi.getPublic({ sort: 'latest', limit: 5 }),
      ]);

      setPurchaseHistory(historyResponse.data?.data || []);
      setPopularProducts(popularResponse.data?.data || []);
      setLatestProducts(latestResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch buyer data:', error);
    }
  };

  useEffect(() => {
    if (dashboardType === 'buyer' && isAuthenticated) {
      fetchBuyerData();
    }
  }, [dashboardType, isAuthenticated]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col sm:flex-row">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="hidden sm:flex w-52 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 h-16 border-b border-gray-700 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-semibold"
            >
              <span className="text-base">📊</span>
              <span>ダッシュボード</span>
            </Link>
            
            <Link
              href="/lp/create"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">➕</span>
              <span>新規LP作成</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">📦</span>
              <span>商品管理</span>
            </Link>
            
            <Link
              href="/points/purchase"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">💰</span>
              <span>ポイント購入</span>
            </Link>
            
            <Link
              href="/media"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">🖼️</span>
              <span>メディア</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.username}</div>
              <div className="text-gray-400 text-xs">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-3 sm:px-6 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full">
            {/* Left: Menu Button (Mobile) + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 text-gray-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-white mb-0 truncate">ダッシュボード</h1>
                <p className="text-gray-400 text-xs hidden sm:block">ようこそ、{user?.username}さん</p>
              </div>
            </div>
            
            {/* Right: Actions & User Info */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Point Balance */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900/50 rounded border border-gray-700">
                <span className="text-gray-400 text-xs font-medium">ポイント残高</span>
                <span className="text-white text-sm font-semibold">{pointBalance.toLocaleString()} P</span>
              </div>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="text-right">
                <div className="text-white text-xs font-semibold">{pointBalance.toLocaleString()}P</div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-b border-gray-700 bg-gray-900/50 p-3 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-semibold"
            >
              <span>📊</span>
              <span>ダッシュボード</span>
            </Link>
            <Link
              href="/lp/create"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm"
            >
              <span>➕</span>
              <span>新規LP作成</span>
            </Link>
            <Link
              href="/products"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm"
            >
              <span>📦</span>
              <span>商品管理</span>
            </Link>
            <Link
              href="/points/purchase"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm"
            >
              <span>💰</span>
              <span>ポイント購入</span>
            </Link>
            <Link
              href="/media"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm"
            >
              <span>🖼️</span>
              <span>メディア</span>
            </Link>
            <hr className="border-gray-700 my-2" />
            <div className="px-3 py-2 flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">{user?.username}</div>
                <div className="text-gray-400 text-xs">{user?.user_type}</div>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setShowMobileMenu(false);
              }}
              className="w-full px-3 py-1.5 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors text-xs font-semibold"
            >
              ログアウト
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-6">

          {/* Dashboard Type Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setDashboardType('seller')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  dashboardType === 'seller'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏪 Sellerダッシュボード
              </button>
              <button
                onClick={() => setDashboardType('buyer')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  dashboardType === 'buyer'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛍️ Buyerダッシュボード
              </button>
            </div>
          </div>

          {/* Seller Dashboard */}
          {dashboardType === 'seller' && (
            <>
              {/* Recently Edited LPs */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-lg font-semibold text-white">最近編集したLP</h2>
              <Link
                href="/lp/create"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold self-start sm:self-auto"
              >
                + 新規LP作成
              </Link>
            </div>

            {lps.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📄</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">LPがありません</h3>
                <p className="text-gray-400 text-sm font-medium mb-3 sm:mb-4">最初のLPを作成しましょう</p>
                <Link
                  href="/lp/create"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  新規LP作成
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {lps.map((lp: any) => {
                  const heroImage = lp.heroImage;

                  return (
                  <div
                    key={lp.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 sm:h-32 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center flex-shrink-0">
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={lp.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-2xl sm:text-4xl">📄</div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                        {lp.is_published ? (
                          <span className="px-1.5 py-0.5 bg-green-500 text-white text-[9px] sm:text-[10px] rounded-full font-semibold">
                            公開中
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-gray-500 text-white text-[9px] sm:text-[10px] rounded-full font-semibold">
                            下書き
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 flex-1 flex flex-col">
                      <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 truncate">{lp.title}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 mb-2 font-medium">
                        <span className="truncate">閲覧: {lp.total_views || 0}</span>
                        <span className="truncate">クリック: {lp.total_cta_clicks || 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        <Link
                          href={`/lp/${lp.id}/edit`}
                          className="px-1 sm:px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-center text-[10px] sm:text-xs font-semibold"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/lp/${lp.id}/analytics`}
                          className="px-1 sm:px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-center text-[10px] sm:text-xs font-semibold"
                        >
                          分析
                        </Link>
                        <button
                          onClick={() => handleDeleteLP(lp.id)}
                          className="px-1 sm:px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-[10px] sm:text-xs font-semibold"
                        >
                          削除
                        </button>
                      </div>

                      {/* Public URL */}
                      {lp.is_published && lp.slug && (
                        <div className="border-t border-gray-700 pt-1.5">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={`${window.location.origin}/view/${lp.slug}`}
                              readOnly
                              className="flex-1 px-1 py-0.5 bg-gray-900 border border-gray-700 rounded text-gray-400 text-[8px] sm:text-[10px] min-w-0"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/view/${lp.slug}`);
                                alert('URLをコピーしました');
                              }}
                              className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[8px] sm:text-[10px] hover:bg-blue-700 transition-colors whitespace-nowrap font-semibold"
                            >
                              コピー
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Bottom Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">📊</span>
                <div className="min-w-0">
                  <div className="text-gray-400 text-[10px] sm:text-xs font-medium">ご利用中のプラン</div>
                  <div className="text-white text-xs sm:text-sm font-semibold truncate">無料プラン</div>
                </div>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium">
                LP作成数: 無制限
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">📈</span>
                <div className="min-w-0">
                  <div className="text-gray-400 text-[10px] sm:text-xs font-medium">登録中のLP数</div>
                  <div className="text-white text-xs sm:text-sm font-semibold truncate">{lps.length}本</div>
                </div>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium">
                公開中: {lps.filter(lp => lp.is_published).length}本
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">💼</span>
                <div className="min-w-0">
                  <div className="text-gray-400 text-[10px] sm:text-xs font-medium">販売実績</div>
                  <div className="text-white text-xs sm:text-sm font-semibold">{products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
                </div>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs font-medium">
                総売上: {totalSales.toLocaleString()}P
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 sm:p-4">
              <div className="text-gray-400 text-[10px] sm:text-xs font-medium mb-1">登録商品数</div>
              <div className="text-white text-base sm:text-lg font-semibold">{products.length}商品</div>
              <div className="text-gray-500 text-[10px] sm:text-xs font-medium mt-1">販売中: {products.filter(p => p.is_available).length}商品</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 sm:p-4">
              <div className="text-gray-400 text-[10px] sm:text-xs font-medium mb-1">今月の売上</div>
              <div className="text-white text-base sm:text-lg font-semibold">{totalSales.toLocaleString()}P</div>
              <div className="text-gray-500 text-[10px] sm:text-xs font-medium mt-1">販売件数: {products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 sm:p-4">
              <div className="text-gray-400 text-[10px] sm:text-xs font-medium mb-1">総閲覧数</div>
              <div className="text-white text-base sm:text-lg font-semibold">{lps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0)}</div>
              <div className="text-gray-500 text-[10px] sm:text-xs font-medium mt-1">CTAクリック: {lps.reduce((sum: number, lp: any) => sum + (lp.total_cta_clicks || 0), 0)}回</div>
            </div>
          </div>
            </>
          )}

          {/* Buyer Dashboard */}
          {dashboardType === 'buyer' && (
            <>
              {/* Point Balance Card */}
              <div className="mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <div className="text-sm font-medium mb-2">現在のポイント残高</div>
                  <div className="text-4xl font-bold mb-4">{pointBalance.toLocaleString()} P</div>
                  <Link
                    href="/points/purchase"
                    className="inline-block px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors text-sm font-semibold"
                  >
                    ポイントを購入する
                  </Link>
                </div>
              </div>

              {/* Purchase History */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">購入履歴</h2>
                {purchaseHistory.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
                    <div className="text-4xl mb-3">🛒</div>
                    <h3 className="text-xl font-semibold text-white mb-2">購入履歴はまだありません</h3>
                    <p className="text-gray-400 text-sm">商品を購入すると、ここに履歴が表示されます</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchaseHistory.map((transaction: any) => (
                      <div key={transaction.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-semibold text-sm">{transaction.description}</h3>
                            <p className="text-gray-400 text-xs">{new Date(transaction.created_at).toLocaleDateString('ja-JP')}</p>
                          </div>
                          <span className="text-red-400 font-semibold">{transaction.amount?.toLocaleString()} P</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Products */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">🔥 人気の商品</h2>
                {popularProducts.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-gray-400 text-sm">現在人気商品はありません</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {popularProducts.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 hover:border-gray-600 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                            {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <span className="text-gray-400 text-xs">{product.seller_username}</span>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-semibold text-sm">{product.price_in_points?.toLocaleString()} P</span>
                          <span className="text-gray-500 text-xs">🔥 {product.total_sales}件</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest Products */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">✨ 新着商品</h2>
                {latestProducts.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-gray-400 text-sm">現在新着商品はありません</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {latestProducts.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-3 hover:border-gray-600 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                            {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <span className="text-gray-400 text-xs">{product.seller_username}</span>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-semibold text-sm">{product.price_in_points?.toLocaleString()} P</span>
                          <span className="text-gray-500 text-xs">✨ NEW</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buyer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
                  <div className="text-gray-400 text-xs font-medium mb-1">総購入回数</div>
                  <div className="text-white text-lg font-semibold">{purchaseHistory.length}回</div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
                  <div className="text-gray-400 text-xs font-medium mb-1">総使用ポイント</div>
                  <div className="text-white text-lg font-semibold">
                    {Math.abs(purchaseHistory.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)).toLocaleString()} P
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
                  <div className="text-gray-400 text-xs font-medium mb-1">購入商品数</div>
                  <div className="text-white text-lg font-semibold">{purchaseHistory.length}個</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
