'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { pointsApi } from '@/lib/api';
import DSwipeLogo from '@/components/DSwipeLogo';
import { getDashboardNavLinks, isDashboardLinkActive } from '@/components/dashboard/navLinks';
import {
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

const POINT_PACKAGES = [
  { points: 1000, price: 1000, bonus: 0 },
  { points: 3000, price: 3000, bonus: 300 },
  { points: 5000, price: 5000, bonus: 700 },
  { points: 10000, price: 10000, bonus: 2000 },
];

const PAYMENT_METHODS = [
  { id: 'stripe', name: 'クレジットカード', icon: <CreditCardIcon className="h-6 w-6" aria-hidden="true" />, status: 'coming_soon' },
  { id: 'paypal', name: 'PayPal', icon: <BanknotesIcon className="h-6 w-6" aria-hidden="true" />, status: 'coming_soon' },
  { id: 'bank', name: '銀行振込', icon: <BuildingLibraryIcon className="h-6 w-6" aria-hidden="true" />, status: 'coming_soon' },
];

export default function PointPurchasePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();
  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const pathname = usePathname();
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden sm:flex w-52 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex flex-col">
        <div className="px-6 h-16 border-b border-slate-800 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="medium" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-0.5">
            {navLinks.map((link) => {
              const isActive = isDashboardLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors text-sm font-medium ${
                    isActive
                      ? 'text-white bg-blue-600/90'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.username}</div>
              <div className="text-slate-400 text-xs capitalize">{user?.user_type}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-600/10 text-red-300 rounded hover:bg-red-600/20 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-800 px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left: Page Title & Description (Hidden on Mobile) */}
          <div className="hidden sm:block flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-white mb-0.5">ポイント購入</h1>
            <p className="text-slate-400 text-[11px] sm:text-xs font-medium truncate">安全な決済と安定した運用のためのポイント管理ダッシュボード</p>
          </div>
          
          {/* Right: Point Balance & User Info */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Point Balance (Hidden on Mobile) */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-slate-400 text-xs font-medium tracking-wide">ポイント残高</span>
              <span className="text-white text-sm font-semibold">{pointBalance.toLocaleString()} P</span>
            </div>
            
            {/* User Avatar (Desktop) */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        <div className="sm:hidden border-b border-slate-800 bg-slate-950/80">
          <nav className="flex items-center gap-2 overflow-x-auto px-3 py-2">
            {navLinks.map((link) => {
              const isActive = isDashboardLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/90 text-white'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 max-w-6xl mx-auto">
          {/* Left Column - Purchase */}
          <div className="lg:col-span-2 space-y-6">
            {/* Point Packages */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.9)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">ポイントパッケージ</h2>
                  <p className="text-sm text-slate-400 mt-1">利用規模に合わせて柔軟に選択できます</p>
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Secure purchase</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {POINT_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage.points === pkg.points;
                  return (
                    <button
                      key={pkg.points}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`rounded-2xl border transition-all text-left p-4 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                        isSelected
                          ? 'border-blue-500/80 bg-blue-500/15 shadow-[0_15px_40px_-25px_rgba(37,99,235,0.8)]'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xl sm:text-2xl font-semibold text-white">
                            {pkg.points.toLocaleString()} P
                          </p>
                          {pkg.bonus > 0 && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                              +{pkg.bonus.toLocaleString()}P ボーナス
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-sm font-semibold text-blue-200">選択中</span>
                        )}
                      </div>
                      <p className="mt-4 text-sm text-slate-400">¥{pkg.price.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-4 sm:mb-6">支払い方法</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedPaymentMethod.id === method.id;
                  const isComingSoon = method.status === 'coming_soon';
                  return (
                    <button
                      key={method.id}
                      onClick={() => !isComingSoon && setSelectedPaymentMethod(method)}
                      disabled={isComingSoon}
                      className={`w-full rounded-2xl border transition-all flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 text-left ${
                        isSelected
                          ? 'border-blue-500/80 bg-blue-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      } ${isComingSoon ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                          {method.icon}
                        </span>
                        <span className="text-white text-sm sm:text-base font-medium truncate">{method.name}</span>
                      </div>
                      {isComingSoon ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300">
                          準備中
                        </span>
                      ) : isSelected ? (
                        <span className="text-blue-300 text-sm font-semibold">選択済み</span>
                      ) : (
                        <span className="text-slate-500 text-sm">選択</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase Button */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div>
                  <div className="text-slate-400 text-xs sm:text-sm">購入ポイント</div>
                  <div className="text-2xl sm:text-3xl font-semibold text-white">
                    {(selectedPackage.points + selectedPackage.bonus).toLocaleString()} P
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs sm:text-sm">お支払い金額</div>
                  <div className="text-2xl sm:text-3xl font-semibold text-white">
                    ¥{selectedPackage.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePurchase}
                className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-blue-600/90 text-white text-sm sm:text-base font-semibold hover:bg-blue-500 transition-colors"
              >
                購入手続きへ進む
              </button>
              <p className="mt-3 sm:mt-4 text-center text-slate-400 text-xs sm:text-sm">
                オンライン決済との連携は現在準備中です。公開まで今しばらくお待ちください。
              </p>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 text-white shadow-[0_20px_70px_-60px_rgba(30,64,175,0.9)]">
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-blue-200/70">Current balance</p>
              <p className="mt-3 text-2xl sm:text-4xl font-semibold">
                {pointBalance.toLocaleString()} <span className="text-base sm:text-xl text-blue-200/80 font-normal">P</span>
              </p>
              <p className="mt-2 text-xs text-blue-100/70">
                購入後の見込み残高: {(pointBalance + selectedPackage.points + selectedPackage.bonus).toLocaleString()}P
              </p>
            </div>

            {/* Purchase History */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">直近のポイント購入</h3>
              {transactions.length === 0 ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 py-10 text-center text-sm text-slate-400">
                  まだ購入履歴がありません
                </div>
              ) : (
                <div className="divide-y divide-slate-800/70">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-white">+{Math.abs(tx.amount).toLocaleString()} P</p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300">完了</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-white mb-3">ポイント運用ガイドライン</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                  <span>1ポイント = 1円相当。全ての決済にご利用いただけます。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                  <span>ポイントに有効期限はありません。年度を跨いでも繰り越し可能です。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                  <span>購入後のポイント返金は承っておりません。必要数量をご確認ください。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                  <span>大口購入・法人契約については専任担当がご案内いたします。</span>
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
