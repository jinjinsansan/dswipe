'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageLoader } from '@/components/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { pointsApi } from '@/lib/api';
import { loadCache, saveCache } from '@/lib/cache';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  GiftIcon,
  ShoppingBagIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  related_product_id?: string;
  description?: string;
  created_at: string;
}

interface TransactionListResponse {
  data: Transaction[];
  total: number;
  limit: number;
  offset: number;
  transaction_type_filter?: string;
}

const formatDate = (value: string) => {
  if (!value) return value;
  const normalized = value.includes('Z') || value.includes('+') ? value : `${value}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
    timeZoneName: 'short',
  }).format(date);
};

const formatPoints = (amount: number) => new Intl.NumberFormat('ja-JP').format(amount);

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
    case 'product_purchase':
      return <ShoppingBagIcon className="h-5 w-5 text-purple-500" />;
    case 'bonus':
      return <GiftIcon className="h-5 w-5 text-green-500" />;
    case 'refund':
      return <ArrowPathIcon className="h-5 w-5 text-orange-500" />;
    default:
      return <ArrowTrendingUpIcon className="h-5 w-5 text-slate-500" />;
  }
};

const getTransactionLabel = (type: string) => {
  switch (type) {
    case 'purchase':
      return 'ポイント購入';
    case 'product_purchase':
      return 'LP購入';
    case 'bonus':
      return 'ボーナス';
    case 'refund':
      return '返金';
    default:
      return type;
  }
};

const getTransactionBadgeClass = (type: string) => {
  switch (type) {
    case 'purchase':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'product_purchase':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'bonus':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'refund':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

const FILTERS: Array<{ label: string; value: string | null }> = [
  { label: 'すべて', value: null },
  { label: 'ポイント購入', value: 'purchase' },
  { label: 'LP購入', value: 'product_purchase' },
  { label: 'ボーナス', value: 'bonus' },
  { label: '返金', value: 'refund' },
];

const POINT_HISTORY_CACHE_TTL = 90_000; // 90 seconds

interface PointHistoryCacheSnapshot {
  transactions: Transaction[];
  total: number;
}

export default function PointHistoryPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const cacheKey = useMemo(() => `points-history-${filterType ?? 'all'}`, [filterType]);

  const fetchTransactions = useCallback(async (options?: { showSpinner?: boolean }) => {
    try {
      if (options?.showSpinner ?? true) {
        setIsLoading(true);
      }
      setError(null);

      const response = await pointsApi.getTransactions({
        limit: 100,
        offset: 0,
        transaction_type: filterType ?? undefined,
      });

      const payload = response.data as TransactionListResponse | Transaction[] | { data?: Transaction[]; total?: number };
      const rows = Array.isArray((payload as TransactionListResponse)?.data)
        ? (payload as TransactionListResponse).data
        : Array.isArray(payload)
        ? (payload as Transaction[])
        : [];

      setTransactions(rows);
      const reportedTotal = (payload as TransactionListResponse)?.total;
      setTotal(typeof reportedTotal === 'number' ? reportedTotal : rows.length);
      saveCache(cacheKey, {
        transactions: rows,
        total: typeof reportedTotal === 'number' ? reportedTotal : rows.length,
      });
    } catch (err: unknown) {
      console.error('Error fetching transactions:', err);
      const message = err instanceof Error ? err.message : undefined;
      setError(message ?? 'トランザクション履歴の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, filterType]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }
    const cached = loadCache<PointHistoryCacheSnapshot>(cacheKey, POINT_HISTORY_CACHE_TTL);
    if (cached) {
      setTransactions(Array.isArray(cached.transactions) ? cached.transactions : []);
      setTotal(typeof cached.total === 'number' ? cached.total : 0);
      setError(null);
      setIsLoading(false);
      fetchTransactions({ showSpinner: false }).catch(() => {
        /* background refresh errors handled inside */
      });
    } else {
      fetchTransactions({ showSpinner: true });
    }
  }, [cacheKey, fetchTransactions, isAuthenticated, isInitialized]);

  const summary = useMemo(() => {
    const income = transactions.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const spending = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0);
    const bonuses = transactions
      .filter((tx) => tx.transaction_type === 'bonus')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      income,
      spending,
      bonuses,
    };
  }, [transactions]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle="ポイント履歴"
      pageSubtitle={total ? `${total}件のトランザクション` : '最新のポイント活動を確認できます'}
    >
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => setFilterType(filter.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      filterType === filter.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  void fetchTransactions({ showSpinner: true });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ArrowPathIcon className="h-4 w-4" />
                更新
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">累計加算</p>
                <p className="mt-3 text-2xl font-semibold text-emerald-600">
                  +{formatPoints(summary.income)}P
                </p>
                <p className="mt-1 text-xs text-slate-500">ポイント購入やボーナスの合計</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">累計消費</p>
                <p className="mt-3 text-2xl font-semibold text-rose-600">
                  {formatPoints(summary.spending)}P
                </p>
                <p className="mt-1 text-xs text-slate-500">LP購入などの合計</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">ボーナス</p>
                <p className="mt-3 text-2xl font-semibold text-blue-600">
                  +{formatPoints(summary.bonuses)}P
                </p>
                <p className="mt-1 text-xs text-slate-500">キャンペーンや特典による加算</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                トランザクション履歴がありません
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                        {getTransactionIcon(tx.transaction_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getTransactionBadgeClass(
                                tx.transaction_type
                              )}`}
                            >
                              {getTransactionLabel(tx.transaction_type)}
                            </span>
                            {tx.description ? (
                              <p className="mt-2 text-sm text-slate-700">{tx.description}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.amount > 0 ? '+' : ''}
                              {formatPoints(tx.amount)}P
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>{formatDate(tx.created_at)}</span>
                          <span className="text-slate-400">ID: {tx.id.slice(0, 8)}...</span>
                          {tx.related_product_id ? (
                            <span className="text-slate-400">商品ID: {tx.related_product_id.slice(0, 8)}...</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
      </div>
    </DashboardLayout>
  );
}
