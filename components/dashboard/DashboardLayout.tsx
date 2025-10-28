'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';
import DSwipeLogo from '@/components/DSwipeLogo';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { pointsApi } from '@/lib/api';
import {
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DashboardLayout({
  children,
  pageTitle,
  pageSubtitle,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const navLinks = useMemo(
    () => getDashboardNavLinks({ isAdmin, userType: user?.user_type }),
    [isAdmin, user?.user_type]
  );
  const navGroups = useMemo(() => groupDashboardNavLinks(navLinks), [navLinks]);
  const activeNavLink = useMemo(
    () => navLinks.find((link) => isDashboardLinkActive(pathname, link.href)),
    [navLinks, pathname]
  );
  const resolvedPageTitle = pageTitle ?? activeNavLink?.label ?? 'ダッシュボード';
  const resolvedSubtitle = pageSubtitle;

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const fetchPointBalance = async () => {
      setIsBalanceLoading(true);
      try {
        const response = await pointsApi.getBalance();
        if (!isActive) return;
        setPointBalance(response.data.point_balance ?? 0);
      } catch (error) {
        console.error('Failed to fetch point balance:', error);
      } finally {
        if (isActive) {
          setIsBalanceLoading(false);
          setIsLoading(false);
        }
      }
    };

    fetchPointBalance();

    return () => {
      isActive = false;
    };
  }, [isInitialized, isAuthenticated, user, setPointBalance]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col sm:flex-row">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="hidden sm:flex w-52 bg-white/90 backdrop-blur-sm flex-col flex-shrink-0 border-r border-slate-200/80">
        <div className="px-4 h-20 border-b border-slate-200 flex items-center">
          <Link href="/dashboard" className="block">
            <DSwipeLogo size="large" showFullName={true} textColor="text-slate-900" />
          </Link>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {navGroups.map((group) => {
              const meta = getDashboardNavGroupMeta(group.key);
              return (
                <div key={group.key} className="space-y-1.5">
                  <p className={`px-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${meta.headingClass}`}>
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
        </nav>

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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          user={user}
          pointBalance={pointBalance}
          pageTitle={resolvedPageTitle}
          pageSubtitle={resolvedSubtitle}
          isBalanceLoading={isBalanceLoading}
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
