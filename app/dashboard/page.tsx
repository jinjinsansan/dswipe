'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { lpApi, pointsApi, productApi, authApi } from '@/lib/api';
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
  const [dashboardType, setDashboardType] = useState<'seller' | 'buyer' | 'settings'>('seller');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

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
      // 全てのトランザクションを取得
      const allTransactions = await pointsApi.getTransactions({ limit: 50 });

      // transaction_typeに関係なく、product_purchase関連を全て表示
      const purchaseTransactions = allTransactions.data?.data?.filter(
        (tx: any) => tx.transaction_type === 'product_purchase'
      ) || [];
      
      setPurchaseHistory(purchaseTransactions);

      // 人気商品を取得（エラーでも続行）
      try {
        const popularResponse = await productApi.getPublic({ sort: 'popular', limit: 5 });
        setPopularProducts(popularResponse.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch popular products:', error);
        setPopularProducts([]);
      }

      // 新着商品を取得（エラーでも続行）
      try {
        const latestResponse = await productApi.getPublic({ sort: 'latest', limit: 5 });
        setLatestProducts(latestResponse.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch latest products:', error);
        setLatestProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch buyer data:', error);
    }
  };

  useEffect(() => {
    if (dashboardType === 'buyer' && isAuthenticated) {
      fetchBuyerData();
    }
  }, [dashboardType, isAuthenticated]);



  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUpdateSuccess(false);

    // バリデーション
    if (!newUsername.trim()) {
      setUsernameError('ユーザー名を入力してください');
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      setUsernameError('ユーザー名は3-20文字で入力してください');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setUsernameError('ユーザー名は英数字とアンダースコアのみ使用できます');
      return;
    }

    try {
      const response = await authApi.updateProfile({ username: newUsername });
      
      // 更新されたユーザー情報をストアに保存
      const updatedUser = response.data;
      useAuthStore.getState().setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUpdateSuccess(true);
      setNewUsername('');
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      setUsernameError(error.response?.data?.detail || 'ユーザー名の更新に失敗しました');
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

  const handleDuplicateLP = async (lpId: string) => {
    try {
      setDuplicatingId(lpId);
      const response = await lpApi.duplicate(lpId);
      const duplicated = response.data;
      await fetchData();
      alert('LPを複製しました。新しいドラフトを開きます。');
      if (duplicated?.id) {
        router.push(`/lp/${duplicated.id}/edit`);
      }
    } catch (error: any) {
      console.error('Failed to duplicate LP:', error);
      alert(error.response?.data?.detail || 'LPの複製に失敗しました');
    } finally {
      setDuplicatingId(null);
    }
  };

  const totalPointsUsed = Math.abs(purchaseHistory.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0));
  const averagePointsUsed = purchaseHistory.length ? Math.round(totalPointsUsed / purchaseHistory.length) : 0;
  const lastPurchaseDateLabel = purchaseHistory.length
    ? new Date(purchaseHistory[0].created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '未購入';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col sm:flex-row">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="hidden sm:flex w-52 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 h-16 border-b border-slate-800 flex items-center">
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
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">➕</span>
              <span>新規LP作成</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">🏪</span>
              <span>マーケット</span>
            </Link>
            
            <Link
              href="/points/purchase"
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">💰</span>
              <span>ポイント購入</span>
            </Link>
            
            <Link
              href="/media"
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm font-medium"
            >
              <span className="text-base">🖼️</span>
              <span>メディア</span>
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.username}</div>
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
        <div className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 px-3 sm:px-6 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full">
            {/* Left: Menu Button (Mobile) + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 text-slate-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-white mb-0 truncate">ダッシュボード</h1>
                <p className="text-slate-400 text-xs hidden sm:block">ようこそ、{user?.username}さん</p>
              </div>
            </div>
            
            {/* Right: Actions & User Info */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Point Balance */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 text-xs font-medium">ポイント残高</span>
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
          <div className="sm:hidden border-b border-slate-800 bg-slate-950/60 p-3 space-y-1">
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
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm"
            >
              <span>➕</span>
              <span>新規LP作成</span>
            </Link>
            <Link
              href="/products"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm"
            >
              <span>📦</span>
              <span>商品管理</span>
            </Link>
            <Link
              href="/points/purchase"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm"
            >
              <span>💰</span>
              <span>ポイント購入</span>
            </Link>
            <Link
              href="/media"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors text-sm"
            >
              <span>🖼️</span>
              <span>メディア</span>
            </Link>
            <hr className="border-slate-800 my-2" />
            <div className="px-3 py-2 flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">{user?.username}</div>
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
            <div className="flex gap-1 sm:gap-2 border-b border-slate-800 overflow-x-auto">
              <button
                onClick={() => setDashboardType('seller')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  dashboardType === 'seller'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏪 販売者画面
              </button>
              <button
                onClick={() => setDashboardType('buyer')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  dashboardType === 'buyer'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🛍️ 購入者画面
              </button>
              <button
                onClick={() => setDashboardType('settings')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  dashboardType === 'settings'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚙️ 設定
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
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📄</div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">LPがありません</h3>
                <p className="text-slate-400 text-sm font-medium mb-3 sm:mb-4">最初のLPを作成しましょう</p>
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
                    className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col"
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
                          <span className="px-1.5 py-0.5 bg-slate-500 text-white text-[9px] sm:text-[10px] rounded-full font-semibold">
                            下書き
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 flex-1 flex flex-col">
                      <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 truncate">{lp.title}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400 mb-2 font-medium">
                        <span className="truncate">閲覧: {lp.total_views || 0}</span>
                        <span className="truncate">クリック: {lp.total_cta_clicks || 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        <Link
                          href={`/lp/${lp.id}/edit`}
                          className="px-1 sm:px-2 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors text-center text-[10px] sm:text-xs font-semibold"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/lp/${lp.id}/analytics`}
                          className="px-1 sm:px-2 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors text-center text-[10px] sm:text-xs font-semibold"
                        >
                          分析
                        </Link>
                        <button
                          onClick={() => handleDuplicateLP(lp.id)}
                          disabled={duplicatingId === lp.id}
                          className={`px-1 sm:px-2 py-1 bg-slate-800 text-white rounded transition-colors text-[10px] sm:text-xs font-semibold ${duplicatingId === lp.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                        >
                          {duplicatingId === lp.id ? '複製中…' : '複製'}
                        </button>
                        <button
                          onClick={() => handleDeleteLP(lp.id)}
                          className="px-1 sm:px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-[10px] sm:text-xs font-semibold"
                        >
                          削除
                        </button>
                      </div>

                      {/* Public URL */}
                      {lp.is_published && lp.slug && (
                        <div className="border-t border-slate-800 pt-1.5">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={`${window.location.origin}/view/${lp.slug}`}
                              readOnly
                              className="flex-1 px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 text-[8px] sm:text-[10px] min-w-0"
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
            <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">📊</span>
                <div className="min-w-0">
                  <div className="text-slate-400 text-[10px] sm:text-xs font-medium">ご利用中のプラン</div>
                  <div className="text-white text-xs sm:text-sm font-semibold truncate">無料プラン</div>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium">
                LP作成数: 無制限
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">📈</span>
                <div className="min-w-0">
                  <div className="text-slate-400 text-[10px] sm:text-xs font-medium">登録中のLP数</div>
                  <div className="text-white text-xs sm:text-sm font-semibold truncate">{lps.length}本</div>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium">
                公開中: {lps.filter(lp => lp.is_published).length}本
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">💼</span>
                <div className="min-w-0">
                  <div className="text-slate-400 text-[10px] sm:text-xs font-medium">販売実績</div>
                  <div className="text-white text-xs sm:text-sm font-semibold">{products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium">
                総売上: {totalSales.toLocaleString()}P
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 p-3 sm:p-4">
              <div className="text-slate-400 text-[10px] sm:text-xs font-medium mb-1">登録商品数</div>
              <div className="text-white text-base sm:text-lg font-semibold">{products.length}商品</div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">販売中: {products.filter(p => p.is_available).length}商品</div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 p-3 sm:p-4">
              <div className="text-slate-400 text-[10px] sm:text-xs font-medium mb-1">今月の売上</div>
              <div className="text-white text-base sm:text-lg font-semibold">{totalSales.toLocaleString()}P</div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">販売件数: {products.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0)}件</div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 p-3 sm:p-4">
              <div className="text-slate-400 text-[10px] sm:text-xs font-medium mb-1">総閲覧数</div>
              <div className="text-white text-base sm:text-lg font-semibold">{lps.reduce((sum: number, lp: any) => sum + (lp.total_views || 0), 0)}</div>
              <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">CTAクリック: {lps.reduce((sum: number, lp: any) => sum + (lp.total_cta_clicks || 0), 0)}回</div>
            </div>
          </div>
            </>
          )}

          {/* Buyer Dashboard */}
          {dashboardType === 'buyer' && (
            <>
              <div className="mb-8">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-wider text-slate-300/80">現在のポイント残高</p>
                      <p className="mt-3 text-3xl sm:text-4xl font-semibold text-white">
                        {pointBalance.toLocaleString()} <span className="text-base text-slate-400 font-normal">P</span>
                      </p>
                      <p className="mt-2 text-xs sm:text-sm text-slate-400">
                        残高はリアルタイムで更新されます。購入履歴は下の一覧で確認できます。
                      </p>
                    </div>
                    <Link
                      href="/points/purchase"
                      className="inline-flex items-center justify-center rounded-xl border border-blue-500/60 bg-blue-600/20 px-6 py-3 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-500/40"
                    >
                      ポイントを購入する
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">購入履歴</h2>
                      <span className="text-xs text-slate-400">{purchaseHistory.length}件</span>
                    </div>
                    {purchaseHistory.length === 0 ? (
                      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 py-12 text-center">
                        <h3 className="text-base font-medium text-white mb-2">購入履歴がまだありません</h3>
                        <p className="text-sm text-slate-400">
                          購入が完了すると、ここに明細が表示されます。
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/70">
                        {purchaseHistory.map((transaction: any) => (
                          <div key={transaction.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{transaction.description}</p>
                              <p className="text-xs text-slate-400">
                                {new Date(transaction.created_at).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-rose-300">
                              -{Math.abs(transaction.amount || 0).toLocaleString()} P
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">人気の公開LP</h2>
                      <span className="text-xs text-slate-400">直近のトレンド</span>
                    </div>
                    {popularProducts.length === 0 ? (
                      <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
                        現在人気の公開LPはありません
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {popularProducts.map((product: any) => (
                          <div
                            key={product.id}
                            className="group rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-blue-500/60"
                          >
                            <Link href={`/u/${product.seller_username}`} className="flex items-center gap-3 mb-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/80 text-sm font-semibold text-white">
                                {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <span className="text-sm font-medium text-blue-200 group-hover:text-blue-100 transition-colors">
                                @{product.seller_username}
                              </span>
                            </Link>
                            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{product.title}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-semibold text-blue-200">{product.price_in_points?.toLocaleString()} P</span>
                              <span className="text-slate-500">成約 {product.total_sales} 件</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">新着の公開LP</h2>
                      <span className="text-xs text-slate-400">最新アップデート</span>
                    </div>
                    {latestProducts.length === 0 ? (
                      <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
                        現在新着の公開LPはありません
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {latestProducts.map((product: any) => (
                          <div
                            key={product.id}
                            className="group rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-colors hover:border-emerald-400/50"
                          >
                            <Link href={`/u/${product.seller_username}`} className="flex items-center gap-3 mb-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/80 text-sm font-semibold text-white">
                                {product.seller_username?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <span className="text-sm font-medium text-emerald-200 group-hover:text-emerald-100 transition-colors">
                                @{product.seller_username}
                              </span>
                            </Link>
                            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{product.title}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="font-semibold text-blue-200">{product.price_in_points?.toLocaleString()} P</span>
                              <span className="text-emerald-400">NEW</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                    <p className="text-sm font-medium text-white">ポイント利用サマリー</p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-slate-300">
                        <dt className="text-slate-400">累計使用ポイント</dt>
                        <dd className="font-semibold text-white">{totalPointsUsed.toLocaleString()} P</dd>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <dt className="text-slate-400">平均購入ポイント</dt>
                        <dd className="font-semibold text-white">{averagePointsUsed.toLocaleString()} P</dd>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <dt className="text-slate-400">直近の購入</dt>
                        <dd className="font-semibold text-white">{lastPurchaseDateLabel}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">購入に関するメモ</h3>
                    <ul className="space-y-3 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400 mt-1" />
                        <span>1ポイント = 1円としてご利用いただけます。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400 mt-1" />
                        <span>購入後のポイントに有効期限はありません。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400 mt-1" />
                        <span>大口購入をご希望の場合はサポートまでお問い合わせください。</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400 mt-1" />
                        <span>決済サービスとの連携は現在準備中です。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                    <h3 className="text-sm font-semibold text-white mb-3">購入状況のサマリー</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">総購入回数</span>
                        <span className="font-semibold text-white">{purchaseHistory.length}回</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">総使用ポイント</span>
                        <span className="font-semibold text-white">{totalPointsUsed.toLocaleString()} P</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">購入商品数</span>
                        <span className="font-semibold text-white">{purchaseHistory.length}個</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Dashboard */}
          {dashboardType === 'settings' && (
            <>
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">アカウント設定</h2>

                {/* Current User Info */}
                <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">現在の情報</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">メールアドレス</label>
                      <div className="text-white font-medium">{user?.email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">ユーザー名</label>
                      <div className="text-white font-medium">{user?.username}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">ポイント残高</label>
                      <div className="text-white font-medium">{pointBalance.toLocaleString()} P</div>
                    </div>
                  </div>
                </div>

                {/* Profile Update Form */}
                <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">プロフィール更新</h3>
                  
                  <form onSubmit={handleUsernameChange} className="space-y-4">
                    <div>
                      <label htmlFor="newUsername" className="block text-sm font-medium text-slate-300 mb-2">
                        新しいユーザー名
                      </label>
                      <input
                        id="newUsername"
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="新しいユーザー名を入力"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        3-20文字、英数字とアンダースコア（_）のみ使用可能
                      </p>
                    </div>

                    {usernameError && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {usernameError}
                      </div>
                    )}

                    {updateSuccess && (
                      <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                        ✅ ユーザー名を更新しました
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      更新する
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
