'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import DSwipeLogo from '@/components/DSwipeLogo';
import { useAuthStore } from '@/store/authStore';
import {
  type DashboardNavGroupKey,
  getDashboardNavLinks,
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';

interface DashboardHeaderProps {
  user: any;
  pointBalance: number;
  pageTitle?: string;
  pageSubtitle?: string;
  isBalanceLoading?: boolean;
  requireAuth?: boolean;
}

export default function DashboardHeader({
  user,
  pointBalance,
  pageTitle = 'ダッシュボード',
  pageSubtitle,
  isBalanceLoading = false,
  requireAuth = true,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { isAdmin: isAdminUser } = useAuthStore();
  const isAdmin = user?.user_type === 'admin';
  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const navGroups = groupDashboardNavLinks(navLinks);
  const pinnedCandidates = useMemo(() => {
    if (!navLinks.length) return [] as string[];
    if (user?.user_type === 'seller') {
      return ['/dashboard', '/sales', '/products/manage', '/products', '/notes', '/purchases'];
    }
    return ['/dashboard', '/products', '/notes', '/purchases', '/points/history'];
  }, [navLinks, user?.user_type]);

  const pinnedLinks = useMemo(() => {
    const seen = new Set<string>();
    return pinnedCandidates
      .map((href) => {
        const match = navLinks.find((link) => link.href === href);
        if (match && !seen.has(match.href)) {
          seen.add(match.href);
          return match;
        }
        return null;
      })
      .filter((link): link is typeof navLinks[number] => Boolean(link));
  }, [navLinks, pinnedCandidates]);

  const [activeMobileGroup, setActiveMobileGroup] = useState<DashboardNavGroupKey | null>(navGroups[0]?.key ?? null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [menuTopOffset, setMenuTopOffset] = useState(0);
  const originalBodyOverflow = useRef<string>('');

  const subtitle = pageSubtitle || (user ? `ようこそ、${user?.username}さん` : '');
  const formattedPointBalance = `${pointBalance.toLocaleString()} P`;
  const menuOffset = menuTopOffset || 112;
  const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)';
  const menuHeight = `calc(100vh - ${menuOffset}px - ${safeAreaBottom} - 64px)`;
  const menuPaddingBottom = `calc(3rem + ${safeAreaBottom})`;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navGroups.length) {
      setActiveMobileGroup(null);
      return;
    }
    setActiveMobileGroup((prev) => {
      if (prev && navGroups.some((group) => group.key === prev)) {
        return prev;
      }
      return navGroups[0]?.key ?? null;
    });
  }, [navGroups]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  useLayoutEffect(() => {
    const updateOffset = () => {
      if (!headerRef.current) return;
      const rect = headerRef.current.getBoundingClientRect();
      setMenuTopOffset(rect.height);
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMenuTopOffset(rect.height);
  }, [isMenuOpen, pageTitle, subtitle]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isMenuOpen) {
      originalBodyOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow.current;
      };
    }

    document.body.style.overflow = originalBodyOverflow.current;
  }, [isMenuOpen]);

  const renderBalanceValue = () => {
    if (isBalanceLoading) {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-16 rounded-full bg-slate-300/60 animate-pulse" />
        </span>
      );
    }
    return <span className="text-slate-900 text-sm font-semibold">{formattedPointBalance}</span>;
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      <div className="bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/80 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.25)]">
        <div className="px-3 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="sm:hidden">
              <DSwipeLogo size="small" showFullName={true} textColor="text-slate-900" />
            </Link>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0 truncate">{pageTitle}</h1>
              <p className="text-slate-500 text-xs">{subtitle}</p>
            </div>
            <div className="sm:hidden min-w-0">
              <h1 className="text-base font-semibold text-slate-900 truncate">{pageTitle}</h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded border border-slate-200 min-w-[150px] justify-between">
                  <span className="text-slate-500 text-xs font-medium">ポイント残高</span>
                  {renderBalanceValue()}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm shadow-sm">
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  無料で始める
                </Link>
              </div>
            )}
          </div>

          <div className="sm:hidden flex items-center space-x-3">
            {user ? (
              <>
                <div className="text-right">
                  {isBalanceLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-12 rounded-full bg-slate-300/60 animate-pulse" />
                    </span>
                  ) : (
                    <div className="text-slate-900 text-xs font-semibold">{formattedPointBalance}</div>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0 shadow-sm">
                  {user?.profile_image_url ? (
                    <img src={user.profile_image_url} alt="ユーザーアイコン" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>

        <div className="sm:hidden border-t border-slate-200/70">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white/60 transition-colors"
            aria-expanded={isMenuOpen}
            aria-controls="dashboard-mobile-menu"
          >
            <span>メニュー</span>
            {isMenuOpen ? (
              <ChevronDownIcon className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-hidden="true"
            className="sm:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className="sm:hidden fixed inset-x-0 z-50 px-3 pb-8"
            style={{
              top: menuOffset,
              height: menuHeight,
            }}
          >
            <nav
              id="dashboard-mobile-menu"
              className="rounded-3xl border border-white/60 bg-white/85 backdrop-blur-2xl shadow-2xl p-3 flex flex-col gap-4 h-full overflow-y-auto overscroll-contain"
              style={{ paddingBottom: menuPaddingBottom }}
            >
              {isAdminUser && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between gap-2 rounded-full px-4 py-3 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                    <span>管理者パネル</span>
                  </span>
                </Link>
              )}
              
              {pinnedLinks.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] px-1 text-slate-400">
                    クイックアクセス
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {pinnedLinks.map((link) => {
                      const isActive = isDashboardLinkActive(pathname, link.href);
                      const linkProps = link.external
                        ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                        : { href: link.href };
                      return (
                        <Link
                          key={`mobile-pinned-${link.href}`}
                          {...linkProps}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold transition-colors ${
                            isActive
                              ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center text-slate-500">
                            {link.icon}
                          </span>
                          <span className="truncate">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {navGroups.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {navGroups.map((group) => {
                      const isActive = activeMobileGroup === group.key;
                      const meta = getDashboardNavGroupMeta(group.key);
                      return (
                        <button
                          key={`tab-${group.key}`}
                          type="button"
                          onClick={() => setActiveMobileGroup(group.key)}
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                            isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                          }`}
                          aria-pressed={isActive}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>

                  {navGroups.map((group) => {
                    if (group.key !== activeMobileGroup) return null;
                    return (
                      <div key={`panel-${group.key}`} className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          {group.items.map((link) => {
                            const isActive = isDashboardLinkActive(pathname, link.href);
                            const linkProps = link.external
                              ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                              : { href: link.href };

                            return (
                              <Link
                                key={link.href}
                                {...linkProps}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex h-full flex-col justify-between gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold transition-colors ${
                                  isActive
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="flex h-5 w-5 items-center justify-center text-slate-500">
                                    {link.icon}
                                  </span>
                                  <span className="truncate">{link.label}</span>
                                </span>
                                {link.badge ? (
                                  <span className="text-[9px] font-semibold text-slate-400">{link.badge}</span>
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
          </div>
        </>
      )}
    </header>
  );
}
