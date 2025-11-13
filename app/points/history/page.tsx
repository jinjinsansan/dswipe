'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {useFormatter, useTranslations} from 'next-intl';
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

const FILTERS: Array<{ translationKey: string; value: string | null }> = [
  { translationKey: 'all', value: null },
  { translationKey: 'purchase', value: 'purchase' },
  { translationKey: 'productPurchase', value: 'product_purchase' },
  { translationKey: 'bonus', value: 'bonus' },
  { translationKey: 'refund', value: 'refund' },
];

const TRANSACTION_TYPE_LABEL_MAP: Record<string, 'purchase' | 'productPurchase' | 'bonus' | 'refund'> = {
  purchase: 'purchase',
  product_purchase: 'productPurchase',
  bonus: 'bonus',
  refund: 'refund',
};

const POINT_HISTORY_CACHE_TTL = 90_000; // 90 seconds

interface PointHistoryCacheSnapshot {
  transactions: Transaction[];
  total: number;
}

const POINT_EXPIRY_DAYS = 180;
const MS_IN_DAY = 86_400_000;

export default function PointHistoryPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const formatter = useFormatter();
  const t = useTranslations('pointsHistory');
  const filtersT = useTranslations('pointsHistory.filters');
  const actionsT = useTranslations('pointsHistory.actions');
  const summaryT = useTranslations('pointsHistory.summary');
  const errorsT = useTranslations('pointsHistory.errors');
  const transactionsT = useTranslations('pointsHistory.transactions');

  const pointsSuffix = summaryT('pointsSuffix');

  const formatDate = useCallback((value: string) => {
    if (!value) return value;
    const normalized = value.includes('Z') || value.includes('+') ? value : `${value}Z`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;
    return formatter.dateTime(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
      timeZoneName: 'short',
    });
  }, [formatter]);

  const formatPoints = useCallback((amount: number) => formatter.number(Math.abs(amount)), [formatter]);

  const formatExpiryDate = useCallback(
    (value: Date) =>
      formatter.dateTime(value, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Tokyo',
      }),
    [formatter]
  );

  const formatSignedPoints = useCallback(
    (value: number, options?: { showPlusForZero?: boolean }) => {
      const prefix = value > 0 ? '+' : value < 0 ? '-' : options?.showPlusForZero ? '+' : '';
      return `${prefix}${formatPoints(value)}${pointsSuffix}`;
    },
    [formatPoints, pointsSuffix]
  );

  const transactionTypeLabel = useCallback(
    (type: string) => {
      const key = TRANSACTION_TYPE_LABEL_MAP[type];
      if (key) {
        return transactionsT(`types.${key}`);
      }
      return transactionsT('types.unknown', { value: type });
    },
    [transactionsT]
  );

  const getExpirationInfo = useCallback(
    (timestamp: string) => {
      const purchaseDate = new Date(timestamp);
      if (Number.isNaN(purchaseDate.getTime())) {
        return null;
      }
      const expiryDate = new Date(purchaseDate.getTime() + POINT_EXPIRY_DAYS * MS_IN_DAY);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const expiryStart = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
      const diffDays = Math.floor((expiryStart.getTime() - todayStart.getTime()) / MS_IN_DAY);

      if (diffDays < 0) {
        return { label: transactionsT('expired'), expiryDate, status: 'expired' as const };
      }
      if (diffDays === 0) {
        return { label: transactionsT('expiresToday'), expiryDate, status: 'today' as const };
      }
      return {
        label: transactionsT('expiresIn', { days: diffDays }),
        expiryDate,
        status: 'future' as const,
      };
    },
    [transactionsT]
  );
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
      setError(message ?? errorsT('fetch'));
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, errorsT, filterType]);

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

  const pageSubtitle = total
    ? t('pageSubtitleWithTotal', { total: formatter.number(total) })
    : t('pageSubtitleDefault');

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <DashboardLayout
      pageTitle={t('pageTitle')}
      pageSubtitle={pageSubtitle}
    >
      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.translationKey}
                    onClick={() => setFilterType(filter.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      filterType === filter.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filtersT(filter.translationKey)}
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
                {actionsT('refresh')}
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{summaryT('income.title')}</p>
                <p className="mt-3 text-2xl font-semibold text-emerald-600">
                  {formatSignedPoints(summary.income)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{summaryT('income.description')}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{summaryT('spending.title')}</p>
                <p className="mt-3 text-2xl font-semibold text-rose-600">
                  {formatSignedPoints(summary.spending)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{summaryT('spending.description')}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{summaryT('bonuses.title')}</p>
                <p className="mt-3 text-2xl font-semibold text-blue-600">
                  {formatSignedPoints(summary.bonuses, { showPlusForZero: true })}
                </p>
                <p className="mt-1 text-xs text-slate-500">{summaryT('bonuses.description')}</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                {transactionsT('empty')}
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isPointPurchase = tx.transaction_type === 'purchase' && tx.amount > 0;
                  const expirationInfo = isPointPurchase ? getExpirationInfo(tx.created_at) : null;
                  const expirationAccentClass = expirationInfo
                    ? expirationInfo.status === 'expired'
                      ? 'text-rose-600'
                      : expirationInfo.status === 'today'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                    : '';

                  return (
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
                              {transactionTypeLabel(tx.transaction_type)}
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
                              {formatSignedPoints(tx.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>{formatDate(tx.created_at)}</span>
                          <span className="text-slate-400">{transactionsT('idLabel', { value: `${tx.id.slice(0, 8)}...` })}</span>
                          {tx.related_product_id ? (
                            <span className="text-slate-400">
                              {transactionsT('productIdLabel', { value: `${tx.related_product_id.slice(0, 8)}...` })}
                            </span>
                          ) : null}
                          {expirationInfo ? (
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-slate-400">
                                {transactionsT('expiresOn', { date: formatExpiryDate(expirationInfo.expiryDate) })}
                              </span>
                              <span className={`font-semibold ${expirationAccentClass}`}>{expirationInfo.label}</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
      </div>
    </DashboardLayout>
  );
}
