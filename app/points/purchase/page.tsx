'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { pointsApi } from '@/lib/api';
import DSwipeLogo from '@/components/DSwipeLogo';

const POINT_PACKAGES = [
  { points: 1000, price: 1000, bonus: 0 },
  { points: 3000, price: 3000, bonus: 300 },
  { points: 5000, price: 5000, bonus: 700 },
  { points: 10000, price: 10000, bonus: 2000 },
];

const PAYMENT_METHODS = [
  { id: 'stripe', name: 'クレジットカード', icon: '💳', status: 'coming_soon' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', status: 'coming_soon' },
  { id: 'bank', name: '銀行振込', icon: '🏦', status: 'coming_soon' },
];

export default function PointPurchasePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [pointBalance, setPointBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(POINT_PACKAGES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactions, setTransactions] = useState<any[]>([]);

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
      const [balanceRes, transactionsRes] = await Promise.all([
        pointsApi.getBalance(),
        pointsApi.getTransactions({ transaction_type: 'purchase', limit: 10 }),
      ]);

      setPointBalance(balanceRes.data.point_balance || 0);
      
      const txData = Array.isArray(transactionsRes.data?.data)
        ? transactionsRes.data.data
        : Array.isArray(transactionsRes.data)
        ? transactionsRes.data
        : [];
      
      setTransactions(txData);
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

  const handlePurchase = () => {
    alert('決済機能は準備中です。\n決済サービス（Stripe、PayPal等）との連携は近日公開予定です。');
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
      <aside className="hidden sm:flex w-52 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex flex-col">
        <div className="px-6 h-16 border-b border-gray-700 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
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
              className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-light"
            >
              <span className="text-base">💰</span>
              <span>ポイント購入</span>
            </Link>
            
            <Link
              href="/media"
              className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
            >
              <span className="text-base">🖼️</span>
              <span>メディア</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-700">
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left: Page Title & Description (Hidden on Mobile) */}
          <div className="hidden sm:block flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-light text-white mb-0.5">ポイント購入</h1>
            <p className="text-gray-400 text-[10px] sm:text-xs font-light truncate">ポイントを購入して商品を手に入れましょう</p>
          </div>
          
          {/* Right: Point Balance & User Info */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Point Balance (Hidden on Mobile) */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-900/50 rounded border border-gray-700">
              <span className="text-gray-400 text-xs font-light">ポイント残高</span>
              <span className="text-white text-sm font-light">{pointBalance.toLocaleString()} P</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* User Avatar (Desktop) */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Mobile Only) */}
        {showMobileMenu && (
          <div className="sm:hidden bg-gray-800/50 border-b border-gray-700 p-3">
            <nav className="space-y-0.5 mb-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
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
                className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded text-sm font-light"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="text-base">💰</span>
                <span>ポイント購入</span>
              </Link>
              <Link
                href="/media"
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded transition-colors text-sm font-light"
              >
                <span className="text-base">🖼️</span>
                <span>メディア</span>
              </Link>
            </nav>
            <div className="px-3 py-2 border-t border-gray-700 pt-2">
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
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Purchase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Point Packages */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">ポイントパッケージ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {POINT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.points}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 sm:p-6 rounded-xl border-2 transition-all text-left ${
                      selectedPackage.points === pkg.points
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div>
                        <div className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                          {pkg.points.toLocaleString()} P
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="text-xs sm:text-sm text-green-400">
                            +{pkg.bonus} P ボーナス
                          </div>
                        )}
                      </div>
                      {selectedPackage.points === pkg.points && (
                        <div className="text-blue-400 text-lg sm:text-2xl">✓</div>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">
                      ¥{pkg.price.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">支払い方法</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method)}
                    disabled={method.status === 'coming_soon'}
                    className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      selectedPaymentMethod.id === method.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    } ${method.status === 'coming_soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-2xl sm:text-3xl">{method.icon}</span>
                      <span className="text-white font-semibold text-xs sm:text-base truncate">{method.name}</span>
                    </div>
                    {method.status === 'coming_soon' ? (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs rounded-full flex-shrink-0">
                        準備中
                      </span>
                    ) : selectedPaymentMethod.id === method.id ? (
                      <div className="text-blue-400 text-lg sm:text-2xl">✓</div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase Button */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div>
                  <div className="text-gray-400 text-xs sm:text-sm">購入ポイント</div>
                  <div className="text-xl sm:text-3xl font-bold text-white">
                    {(selectedPackage.points + selectedPackage.bonus).toLocaleString()} P
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-xs sm:text-sm">お支払い金額</div>
                  <div className="text-xl sm:text-3xl font-bold text-white">
                    ¥{selectedPackage.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePurchase}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-xs sm:text-lg shadow-lg shadow-blue-500/50"
              >
                購入手続きへ進む
              </button>
              <p className="mt-3 sm:mt-4 text-center text-gray-500 text-xs sm:text-sm">
                決済機能は準備中です。近日公開予定です。
              </p>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white">
              <div className="text-xs sm:text-sm opacity-90 mb-1 sm:mb-2">現在の残高</div>
              <div className="text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1">{pointBalance.toLocaleString()} P</div>
              <div className="text-xs sm:text-sm opacity-75">
                購入後: {(pointBalance + selectedPackage.points + selectedPackage.bonus).toLocaleString()} P
              </div>
            </div>

            {/* Purchase History */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4">購入履歴</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm text-center py-6 sm:py-8">
                  まだ購入履歴がありません
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-700 last:border-0"
                    >
                      <div>
                        <div className="text-white font-semibold text-xs sm:text-sm">
                          +{tx.amount.toLocaleString()} P
                        </div>
                        <div className="text-gray-400 text-[10px] sm:text-xs">
                          {new Date(tx.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="text-green-400 text-xs sm:text-sm">完了</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">ポイントについて</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-[10px] sm:text-sm">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>1ポイント = 1円相当</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>ポイントの有効期限はありません</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>購入したポイントは返金できません</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>大口購入はボーナスポイント付与</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
