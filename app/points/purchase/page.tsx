'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { pointsApi } from '@/lib/api';

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
              <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                商品管理
              </Link>
              <Link href="/points/purchase" className="text-white font-semibold">
                ポイント購入
              </Link>
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-6">
                <div className="text-right">
                  <div className="text-gray-300 text-sm">{user?.username || 'ユーザー'}</div>
                  <div className="text-blue-400 font-semibold">{pointBalance.toLocaleString()} P</div>
                </div>
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
          <h1 className="text-4xl font-bold text-white mb-2">ポイント購入</h1>
          <p className="text-gray-400">ポイントを購入して商品を手に入れましょう</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Purchase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Point Packages */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">ポイントパッケージ</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {POINT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.points}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedPackage.points === pkg.points
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-3xl font-bold text-white mb-1">
                          {pkg.points.toLocaleString()} P
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="text-sm text-green-400">
                            +{pkg.bonus} P ボーナス
                          </div>
                        )}
                      </div>
                      {selectedPackage.points === pkg.points && (
                        <div className="text-blue-400 text-2xl">✓</div>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      ¥{pkg.price.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">支払い方法</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method)}
                    disabled={method.status === 'coming_soon'}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      selectedPaymentMethod.id === method.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    } ${method.status === 'coming_soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{method.icon}</span>
                      <span className="text-white font-semibold">{method.name}</span>
                    </div>
                    {method.status === 'coming_soon' ? (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        準備中
                      </span>
                    ) : selectedPaymentMethod.id === method.id ? (
                      <div className="text-blue-400 text-2xl">✓</div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase Button */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm">購入ポイント</div>
                  <div className="text-3xl font-bold text-white">
                    {(selectedPackage.points + selectedPackage.bonus).toLocaleString()} P
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">お支払い金額</div>
                  <div className="text-3xl font-bold text-white">
                    ¥{selectedPackage.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePurchase}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg shadow-blue-500/50"
              >
                購入手続きへ進む
              </button>
              <p className="mt-4 text-center text-gray-500 text-sm">
                決済機能は準備中です。近日公開予定です。
              </p>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-2">現在の残高</div>
              <div className="text-4xl font-bold mb-1">{pointBalance.toLocaleString()} P</div>
              <div className="text-sm opacity-75">
                購入後: {(pointBalance + selectedPackage.points + selectedPackage.bonus).toLocaleString()} P
              </div>
            </div>

            {/* Purchase History */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">購入履歴</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  まだ購入履歴がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
                    >
                      <div>
                        <div className="text-white font-semibold">
                          +{tx.amount.toLocaleString()} P
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(tx.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <div className="text-green-400 text-sm">完了</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="text-white font-semibold mb-3">ポイントについて</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
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
      </main>
    </div>
  );
}
