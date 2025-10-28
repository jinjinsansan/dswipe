'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DSwipeLogo from '@/components/DSwipeLogo';
import { PageLoader } from '@/components/LoadingSpinner';
import {
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import { 
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GiftIcon,
  ShoppingBagIcon,
  BanknotesIcon
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatPoints = (amount: number) => {
  return new Intl.NumberFormat('ja-JP').format(amount);
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return <BanknotesIcon className="w-5 h-5 text-blue-500" />;
    case 'product_purchase':
      return <ShoppingBagIcon className="w-5 h-5 text-purple-500" />;
    case 'bonus':
      return <GiftIcon className="w-5 h-5 text-green-500" />;
    case 'refund':
      return <ArrowPathIcon className="w-5 h-5 text-orange-500" />;
    default:
      return <ArrowTrendingUpIcon className="w-5 h-5 text-slate-500" />;
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

const getTransactionColor = (type: string) => {
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

export default function PointHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized, logout, isAdmin } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const navGroups = groupDashboardNavLinks(navLinks);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, filterType]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://swipelaunch-backend.onrender.com/api';
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
      });

      if (filterType) {
        params.append('transaction_type', filterType);
      }

      const response = await fetch(`${apiUrl}/points/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('トランザクション履歴の取得に失敗しました');
      }

      const data: TransactionListResponse = await response.json();
      setTransactions(data.data);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isInitialized || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー（デスクトップ） */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-gray-200 bg-white">
        <div className="p-6">
          <Link href="/dashboard">
            <DSwipeLogo size="large" showFullName={true} />
          </Link>
        </div>

        <nav className="flex-1 px-3 pb-4">
          <div className="flex flex-col gap-4">
            {navGroups.map((group) => {
              const meta = getDashboardNavGroupMeta(group.key);
              return (
                <div key={group.key} className="space-y-1.5">
                  <p className={`px-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.headingClass}`}>
                    {meta.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((link) => {
                      const isActive = isDashboardLinkActive(pathname, link.href);
                      const linkProps = link.external
                        ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
                        : { href: link.href };
                      const styles = getDashboardNavClasses(link, { variant: 'desktop', active: isActive });

                      return (
                        <Link
                          key={link.href}
                          {...linkProps}
                          className={`flex items-center justify-between gap-2 rounded px-3 py-2.5 text-sm font-medium transition-colors ${styles.container}`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className={`flex h-5 w-5 items-center justify-center ${styles.icon}`}>
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </span>
                          {link.badge ? (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-3">
            <p className="text-xs text-gray-500">ログイン中</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.username}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー（モバイル） */}
        <header className="lg:hidden border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <DSwipeLogo size="medium" showFullName={true} />
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* ページヘッダー */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ポイント履歴</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {total}件のトランザクション
                  </p>
                </div>
                <button
                  onClick={fetchTransactions}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">更新</span>
                </button>
              </div>

              {/* フィルター */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === null
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setFilterType('purchase')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'purchase'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ポイント購入
                </button>
                <button
                  onClick={() => setFilterType('product_purchase')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'product_purchase'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  LP購入
                </button>
                <button
                  onClick={() => setFilterType('bonus')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'bonus'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ボーナス
                </button>
              </div>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* トランザクションリスト */}
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-12 text-center">
                <p className="text-gray-500">トランザクション履歴がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(tx.transaction_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTransactionColor(
                                  tx.transaction_type
                                )}`}
                              >
                                {getTransactionLabel(tx.transaction_type)}
                              </span>
                            </div>
                            {tx.description && (
                              <p className="text-sm text-gray-700">{tx.description}</p>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div
                              className={`text-lg font-bold ${
                                tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {tx.amount > 0 ? '+' : ''}
                              {formatPoints(tx.amount)}P
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(tx.created_at)}</span>
                          <span className="text-gray-400">ID: {tx.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
