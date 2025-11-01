'use client';

import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/LoadingSpinner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { pointsApi } from '@/lib/api';
import {
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
}

const POINT_PACKAGES = [
  { points: 1000, price: 1000, bonus: 0 },
  { points: 3000, price: 3000, bonus: 0 },
  { points: 5000, price: 5000, bonus: 0 },
  { points: 10000, price: 10000, bonus: 0 },
  { points: 30000, price: 30000, bonus: 0 },
  { points: 100000, price: 100000, bonus: 0 },
];

const PAYMENT_METHODS = [
  {
    id: 'one_lat',
    name: 'カード・USDT決済（ONE.lat）',
    icon: <CurrencyDollarIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'active',
    description: 'クレジットカード・仮想通貨対応',
  },
  {
    id: 'jpyc',
    name: 'JPYC決済',
    icon: <BanknotesIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
    description: '日本円ステーブルコイン・手数料無料',
  },
  {
    id: 'stripe',
    name: 'クレジットカード',
    icon: <CreditCardIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <BanknotesIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
  {
    id: 'bank',
    name: '銀行振込',
    icon: <BuildingLibraryIcon className="h-6 w-6" aria-hidden="true" />,
    status: 'coming_soon',
  },
];

export default function PointPurchasePage() {
  const { isAuthenticated, isInitialized, pointBalance, setPointBalance } = useAuthStore();
  const [currentBalance, setCurrentBalance] = useState<number>(pointBalance);
  const [selectedPackage, setSelectedPackage] = useState(POINT_PACKAGES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentBalance(pointBalance);
  }, [pointBalance]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    let isActive = true;

    const load = async () => {
      try {
        const [balanceRes, transactionsRes] = await Promise.all([
          pointsApi.getBalance(),
          pointsApi.getTransactions({ transaction_type: 'purchase', limit: 10 }),
        ]);

        if (!isActive) return;

        const fetchedBalance = balanceRes.data.point_balance ?? 0;
        setCurrentBalance(fetchedBalance);
        setPointBalance(fetchedBalance);

        const txData = Array.isArray(transactionsRes.data?.data)
          ? transactionsRes.data.data
          : Array.isArray(transactionsRes.data)
          ? transactionsRes.data
          : [];

        setTransactions(
          (txData as Transaction[]).filter((item): item is Transaction => Boolean(item?.id))
        );
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [isInitialized, isAuthenticated, setPointBalance]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      alert('ポイント購入にはログインが必要です。');
      return;
    }

    if (selectedPaymentMethod.id === 'jpyc') {
      alert(
        'JPYC決済は近日公開予定です。\n\n実装予定機能：\n- ウォレット接続（MetaMask等）\n- ガスレス決済（手数料無料）\n- 1 JPYC = 1円\n\n現在はONE.lat決済をご利用ください。'
      );
      return;
    }

    if (selectedPaymentMethod.status === 'coming_soon') {
      alert('この決済方法は準備中です。\nONE.lat決済（カード・USDT対応）をご利用ください。');
      return;
    }

    if (selectedPaymentMethod.id === 'one_lat') {
      try {
        setIsPurchasing(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error('認証トークンが見つかりません。再ログインしてください。');
        }

        const response = await fetch(`${apiUrl}/points/purchase/one-lat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: selectedPackage.points + selectedPackage.bonus,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('API Error Response:', errorBody);
          throw new Error(`決済の開始に失敗しました (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        window.location.href = data.checkout_url;
      } catch (error: any) {
        console.error('Purchase error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
        alert(`決済エラー:\n${error.message}`);
      } finally {
        setIsPurchasing(false);
      }
    }
  };

  const projectedBalance = currentBalance + selectedPackage.points + selectedPackage.bonus;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="ポイント購入"
      pageSubtitle="安全な決済でポイントを追加できます"
    >
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">ポイントパッケージ</h2>
                    <p className="mt-1 text-sm text-slate-500">利用規模に合わせて柔軟に選択できます</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Secure purchase</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {POINT_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.points === pkg.points;
                    return (
                      <button
                        key={pkg.points}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:p-6 ${
                          isSelected
                            ? 'border-blue-500/70 bg-blue-50 shadow-[0_15px_40px_-25px_rgba(37,99,235,0.4)]'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xl font-semibold text-slate-900 sm:text-2xl">
                              {pkg.points.toLocaleString()} P
                            </p>
                            {pkg.bonus > 0 && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                                +{pkg.bonus.toLocaleString()}P ボーナス
                              </span>
                            )}
                          </div>
                          {isSelected && <span className="text-sm font-semibold text-blue-600">選択中</span>}
                        </div>
                        <p className="mt-4 text-sm text-slate-500">¥{pkg.price.toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:mb-6">支払い方法</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethod.id === method.id;
                    const isComingSoon = method.status === 'coming_soon';
                    return (
                      <button
                        key={method.id}
                        onClick={() => !isComingSoon && setSelectedPaymentMethod(method)}
                        disabled={isComingSoon}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all sm:px-5 sm:py-4 ${
                          isSelected
                            ? 'border-blue-500/70 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        } ${isComingSoon ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            {method.icon}
                          </span>
                          <span className="truncate text-sm font-medium text-slate-900 sm:text-base">
                            {method.name}
                          </span>
                        </div>
                        {isComingSoon ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            準備中
                          </span>
                        ) : isSelected ? (
                          <span className="text-sm font-semibold text-blue-600">選択済み</span>
                        ) : (
                          <span className="text-sm text-slate-500">選択</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                <div className="mb-4 grid grid-cols-2 gap-4 sm:mb-6">
                  <div>
                    <div className="text-xs text-slate-500 sm:text-sm">購入ポイント</div>
                    <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {(selectedPackage.points + selectedPackage.bonus).toLocaleString()} P
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 sm:text-sm">お支払い金額</div>
                    <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      ¥{selectedPackage.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || selectedPaymentMethod.status === 'coming_soon'}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-4 sm:text-base"
                >
                  {isPurchasing ? '処理中...' : '購入手続きへ進む'}
                </button>
                {selectedPaymentMethod.id === 'one_lat' && (
                  <p className="mt-3 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
                    ONE.latの安全な決済ページに移動します（クレジットカード・USDT・その他決済方法対応）
                  </p>
                )}
                {selectedPaymentMethod.id === 'jpyc' && (
                  <p className="mt-3 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
                    JPYC決済は近日公開予定です。ウォレット接続でガスレス決済（手数料無料）を実現します。
                  </p>
                )}
                {selectedPaymentMethod.status === 'coming_soon' && selectedPaymentMethod.id !== 'jpyc' && (
                  <p className="mt-3 text-center text-xs text-slate-500 sm:mt-4 sm:text-sm">
                    この決済方法は現在準備中です。ONE.lat決済をご利用ください。
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-blue-500/70 sm:text-sm">Current balance</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-4xl">
                  {currentBalance.toLocaleString()} <span className="text-base font-normal text-blue-500/80 sm:text-xl">P</span>
                </p>
                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  購入後の見込み残高: {projectedBalance.toLocaleString()}P
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">直近のポイント購入</h3>
                {transactions.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                    まだ購入履歴がありません
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">+{Math.abs(tx.amount).toLocaleString()} P</p>
                          <p className="text-xs text-slate-500">
                            {new Date(tx.created_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">完了</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 sm:text-base">ポイント運用ガイドライン</h3>
                <ul className="space-y-3 text-xs text-slate-600 sm:text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                    <span>1ポイント = 1円相当。全ての決済にご利用いただけます。</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                    <span>ポイントに有効期限はありません。年度を跨いでも繰り越し可能です。</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                    <span>ポイントを一度購入するとキャンセルおよび払い戻しは不可となります。</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-300" />
                    <span>決済完了後は即時にポイントへ反映されます（遅延が発生した場合はサポートまで）。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
