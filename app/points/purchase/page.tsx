'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardIcon, BanknotesIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { pointsApi } from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Card, Badge, Button, PointsPill } from '@/components/ui';
import { cn } from '@/lib/utils';

const POINT_PACKAGES = [
  { points: 1000, price: 1000, bonus: 0 },
  { points: 3000, price: 3000, bonus: 300 },
  { points: 5000, price: 5000, bonus: 700 },
  { points: 10000, price: 10000, bonus: 2000 },
];

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'coming_soon';
  description?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'onelat', name: 'カード・USDT決済（ONE.lat）', icon: <CreditCardIcon className="h-5 w-5" />, status: 'active', description: 'クレジットカード・USDTで決済' },
  { id: 'jpyc', name: 'JPYC決済', icon: <BanknotesIcon className="h-5 w-5" />, status: 'active', description: '日本円ステーブルコイン・手数料無料' },
  { id: 'stripe', name: 'クレジットカード', icon: <CreditCardIcon className="h-5 w-5" />, status: 'coming_soon' },
  { id: 'bank', name: '銀行振込', icon: <BuildingLibraryIcon className="h-5 w-5" />, status: 'coming_soon' },
];

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
}

export default function PointPurchasePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [pointBalance, setPointBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(POINT_PACKAGES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handlePurchase = () => {
    if (selectedPaymentMethod.id === 'onelat') {
      alert('ONE.lat決済機能は準備中です。\n近日公開予定です。');
      return;
    }
    if (selectedPaymentMethod.id === 'jpyc') {
      alert('JPYC決済機能は準備中です。');
      return;
    }
    alert('決済機能は準備中です。');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-lg" style={{ color: 'var(--muted)' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  const totalPoints = selectedPackage.points + selectedPackage.bonus;

  return (
    <DashboardShell title="ポイント購入" subtitle="安全な決済と安定した運用のためのポイント管理" actions={<PointsPill value={pointBalance} className="hidden sm:inline-flex" />}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-6 lg:col-span-2">
          {/* Packages */}
          <Card>
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
                  ポイントパッケージ
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  利用規模に合わせて柔軟に選択できます
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {POINT_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage.points === pkg.points;
                return (
                  <button
                    key={pkg.points}
                    onClick={() => setSelectedPackage(pkg)}
                    className={cn('rounded-[16px] border p-4 text-left transition-all sm:p-5')}
                    style={
                      isSelected
                        ? { borderColor: 'var(--brand)', background: 'var(--surface-tint)', boxShadow: 'var(--sh-glow)' }
                        : { borderColor: 'var(--line)', background: 'var(--surface)' }
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
                          {pkg.points.toLocaleString()} P
                        </p>
                        {pkg.bonus > 0 && (
                          <span className="mt-1 inline-block">
                            <Badge tone="live" small>
                              +{pkg.bonus.toLocaleString()}P ボーナス
                            </Badge>
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                          選択中
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
                      ¥{pkg.price.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Payment methods */}
          <Card>
            <h2 className="mb-4 text-xl font-bold" style={{ color: 'var(--ink)' }}>
              支払い方法
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPaymentMethod.id === method.id;
                const isComingSoon = method.status === 'coming_soon';
                return (
                  <button
                    key={method.id}
                    onClick={() => !isComingSoon && setSelectedPaymentMethod(method)}
                    disabled={isComingSoon}
                    className={cn('flex w-full items-center justify-between rounded-[16px] border px-4 py-3 text-left transition-all', isComingSoon && 'cursor-not-allowed opacity-60')}
                    style={isSelected ? { borderColor: 'var(--brand)', background: 'var(--surface-tint)' } : { borderColor: 'var(--line)', background: 'var(--surface)' }}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                        {method.icon}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                          {method.name}
                        </span>
                        {method.description && (
                          <span className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                            {method.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isComingSoon ? (
                      <Badge tone="draft" small>
                        準備中
                      </Badge>
                    ) : isSelected ? (
                      <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                        選択済み
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        選択
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  購入ポイント
                </div>
                <div className="text-3xl font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
                  {totalPoints.toLocaleString()} P
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  お支払い金額
                </div>
                <div className="text-3xl font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
                  ¥{selectedPackage.price.toLocaleString()}
                </div>
              </div>
            </div>
            <Button onClick={handlePurchase} size="lg" block>
              購入手続きへ進む
            </Button>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted)' }}>
              オンライン決済との連携は現在準備中です。公開まで今しばらくお待ちください。
            </p>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <Card>
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--brand)' }}>
              Current balance
            </p>
            <p className="mt-3 text-4xl font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
              {pointBalance.toLocaleString()} <span className="text-xl font-normal" style={{ color: 'var(--brand)' }}>P</span>
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
              購入後の見込み残高: {(pointBalance + totalPoints).toLocaleString()}P
            </p>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--ink)' }}>
              直近のポイント購入
            </h3>
            {transactions.length === 0 ? (
              <div className="rounded-xl border py-10 text-center text-sm" style={{ borderColor: 'var(--line)', background: 'var(--surface-2)', color: 'var(--muted)' }}>
                まだ購入履歴がありません
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                        +{Math.abs(tx.amount).toLocaleString()} P
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(tx.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Badge tone="live" small>
                      完了
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-base font-bold" style={{ color: 'var(--ink)' }}>
              ポイント運用ガイドライン
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-2)' }}>
              {[
                '1ポイント = 1円相当。全ての決済にご利用いただけます。',
                'ポイントに有効期限はありません。年度を跨いでも繰り越し可能です。',
                '購入後のポイント返金は承っておりません。必要数量をご確認ください。',
                '大口購入・法人契約については専任担当がご案内いたします。',
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: 'var(--brand)' }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
