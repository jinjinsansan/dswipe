'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';
import DSwipeLogo from '@/components/DSwipeLogo';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { operatorMessageApi, pointsApi } from '@/lib/api';
import { redirectToLogin } from '@/lib/navigation';
import { useOperatorMessageStore } from '@/store/operatorMessageStore';
import {
  type DashboardNavGroupKey,
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import type { OperatorMessageUnreadCountResponse } from '@/types/api';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  requireAuth?: boolean; // 認証を必須とするか（デフォルト: true）
}

export default function DashboardLayout({
  children,
  pageTitle,
  pageSubtitle,
  requireAuth = true,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    isInitialized,
    logout,
    isAdmin,
    pointBalance,
    setPointBalance,
  } = useAuthStore();
  const { unreadCount, setUnreadCount, lastFetchedAt } = useOperatorMessageStore();
  const lastFetchedUserRef = useRef<string | null>(null);

  const navLinks = useMemo(
    () => getDashboardNavLinks({ isAdmin, userType: user?.user_type, unreadMessageCount: unreadCount }),
    [isAdmin, unreadCount, user?.user_type]
  );
  const navGroups = useMemo(() => groupDashboardNavLinks(navLinks), [navLinks]);
  const activeNavLink = useMemo(
    () => navLinks.find((link) => isDashboardLinkActive(pathname, link.href)),
    [navLinks, pathname]
  );
  const resolvedPageTitle = pageTitle ?? activeNavLink?.label ?? 'ダッシュボード';
  const resolvedSubtitle = pageSubtitle;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next: Record<string, boolean> = {};
      const defaultExpanded = new Set<DashboardNavGroupKey>(['core', 'points']);
      navGroups.forEach((group) => {
        next[group.key] = prev[group.key] ?? defaultExpanded.has(group.key);
      });
      return next;
    });
  }, [navGroups]);

  const toggleGroup = (key: DashboardNavGroupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    if (requireAuth && isInitialized && !isAuthenticated) {
      redirectToLogin(router);
    }
  }, [requireAuth, isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user?.id) {
      lastFetchedUserRef.current = null;
      return;
    }

    if (lastFetchedUserRef.current === user.id) {
      return;
    }

    lastFetchedUserRef.current = user.id;
    let isActive = true;

    const fetchPointBalance = async () => {
      try {
        const response = await pointsApi.getBalance();
        if (!isActive) return;
        const balance = Number(response.data.point_balance);
        if (Number.isFinite(balance)) {
          setPointBalance(balance);
        }
      } catch (error) {
        console.error('Failed to fetch point balance:', error);
      }
    };

    fetchPointBalance();

    return () => {
      isActive = false;
    };
  }, [isInitialized, isAuthenticated, user?.id, setPointBalance]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user?.id) {
      return;
    }

    const now = Date.now();
    if (lastFetchedAt && now - lastFetchedAt < 60_000) {
      return;
    }

    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const response = await operatorMessageApi.unreadCount();
        if (!isMounted) return;
        const count = (response.data as OperatorMessageUnreadCountResponse | { unread_count?: number }).unread_count ?? 0;
        setUnreadCount(count, Date.now());
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch message unread count', error);
        }
      }
    };

    fetchUnread();

    return () => {
      isMounted = false;
    };
  }, [isInitialized, isAuthenticated, user?.id, lastFetchedAt, setUnreadCount]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 初回認証チェック中のみローディング表示
  if (!isInitialized) {
    return <PageLoader />;
  }

  // 認証が必要なページで未認証の場合は何も表示しない（リダイレクト処理が実行される）
  if (requireAuth && (!isAuthenticated || !user)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col sm:flex-row">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="hidden sm:flex w-52 bg-white/90 backdrop-blur-sm flex-col flex-shrink-0 border-r border-slate-200/80">
        <div className="px-4 h-20 border-b border-slate-200 flex items-center">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="block">
            <DSwipeLogo size="large" showFullName={true} textColor="text-slate-900" />
          </Link>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col gap-3 p-3">
              <p className="text-xs text-slate-500 mb-2">アカウントをお持ちの方</p>
              <Link
                href="/login"
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="w-full px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-semibold text-center hover:bg-blue-50 transition-colors"
              >
                無料で始める
              </Link>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3 px-2">
                  探す
                </p>
                <div className="space-y-1">
                  <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors">
                    商品マーケット
                  </Link>
                  <Link href="/notes" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors">
                    AllNOTES
                  </Link>
                  <Link href="/terms" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors">
                    利用規約
                  </Link>
                  <Link href="/tokusho" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors">
                    特定商取引法
                  </Link>
                  <Link href="/privacy" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors">
                    プライバシーポリシー
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {navGroups.map((group) => {
                const meta = getDashboardNavGroupMeta(group.key);
                const isExpanded = expandedGroups[group.key] ?? false;
                return (
                  <div key={group.key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.headingClass} transition-colors hover:bg-slate-100/60`}
                    >
                      <span>{meta.label}</span>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      )}
                    </button>
                    <div className={`${isExpanded ? 'space-y-1' : 'space-y-1 hidden'}`}>
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
                            className={`flex items-center justify-between gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${styles.container}`}
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
          )}
        </nav>

        {isAuthenticated && user && (
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 text-sm font-semibold truncate">{user?.username}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-xs font-semibold"
          >
            ログアウト
          </button>
        </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          user={user}
          pointBalance={pointBalance}
          pageTitle={resolvedPageTitle}
          pageSubtitle={resolvedSubtitle}
          isBalanceLoading={false}
          requireAuth={requireAuth}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
