
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import DSwipeLogo from '@/components/DSwipeLogo';
import { useAuthStore } from '@/store/authStore';
import { operatorMessageApi } from '@/lib/api';
import {
  getDashboardNavClasses,
  getDashboardNavGroupMeta,
  getDashboardNavLinks,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import { useOperatorMessageStore } from '@/store/operatorMessageStore';
import type { OperatorMessageUnreadCountResponse } from '@/types/api';
import {useLocale, useTranslations} from 'next-intl';

interface StickySiteHeaderProps {
  rightSlot?: ReactNode;
  className?: string;
  innerClassName?: string;
  dark?: boolean;
  showDashboardLink?: boolean;
}

export default function StickySiteHeader({
  rightSlot,
  className,
  innerClassName,
  dark = false,
  showDashboardLink = false,
}: StickySiteHeaderProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin: isAdminUser, logout } = useAuthStore();
  const { unreadCount, setUnreadCount, lastFetchedAt } = useOperatorMessageStore();
  const userType = (user?.user_type ?? undefined) as 'seller' | 'buyer' | 'admin' | undefined;
  const isAdmin = userType === 'admin';
  const locale = useLocale();
  const navT = useTranslations('dashboard.navigation');
  const layoutT = useTranslations('dashboard.layout');
  const headerT = useTranslations('dashboard.header');
  const navLinks = useMemo(
    () => getDashboardNavLinks({ isAdmin, userType, unreadMessageCount: unreadCount, translate: navT }),
    [isAdmin, unreadCount, userType, navT]
  );
  const navGroups = useMemo(() => groupDashboardNavLinks(navLinks, { translate: navT, locale }), [navLinks, navT, locale]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [menuTopOffset, setMenuTopOffset] = useState(0);
  const originalBodyOverflow = useRef<string>('');

  const backgroundClass = dark ? 'bg-slate-950/85' : 'bg-white/90';
  const borderClass = dark ? 'border-b border-white/10' : 'border-b border-slate-200/80';
  const textColor = dark ? 'text-white' : 'text-slate-900';
  const headerClassName = ['sticky top-0 z-50 backdrop-blur-lg', backgroundClass, borderClass, className]
    .filter(Boolean)
    .join(' ');
  const containerClassName = [
    'mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8',
    innerClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const dashboardLinkClassName = [
    'hidden text-xs font-semibold uppercase tracking-[0.3em] transition hover:opacity-80 sm:inline-flex',
    dark ? 'text-slate-300' : 'text-slate-500',
  ].join(' ');

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
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
  }, [isAuthenticated, user?.id, lastFetchedAt, setUnreadCount]);

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

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = originalBodyOverflow.current;
      return;
    }

    originalBodyOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow.current;
    };
  }, [isMenuOpen]);

  const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)';
  const menuOffset = menuTopOffset || 72;
  const menuHeight = `calc(100vh - ${menuOffset}px - ${safeAreaBottom} - 48px)`;
  const menuPaddingBottom = `calc(2.5rem + ${safeAreaBottom})`;

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    if (!isAuthenticated) return;
    logout();
    closeMenu();
  };

  const menuButtonClassName = [
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
    dark
      ? 'border border-white/30 bg-white/10 text-white hover:bg-white/20'
      : 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800',
  ].join(' ');

  const defaultRightSlot = (
    <div className="flex items-center gap-3">
      {isAdminUser && (
        <Link
          href="/admin"
          className={`hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            dark
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600'
          }`}
        >
          <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
          <span>{navT('links.admin')}</span>
        </Link>
      )}
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        className={menuButtonClassName}
        aria-expanded={isMenuOpen}
        aria-controls="global-menu"
      >
        <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        <span>{headerT('menu')}</span>
      </button>
    </div>
  );

  return (
    <header ref={headerRef} className={headerClassName}>
      <div className={containerClassName}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <DSwipeLogo size="small" showFullName textColor={textColor} />
          </Link>
          {showDashboardLink ? (
            <Link href="/dashboard" className={dashboardLinkClassName}>
              Dashboard
            </Link>
          ) : null}
        </div>
        {rightSlot ?? defaultRightSlot}
      </div>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-hidden="true"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
          />
          <div
            className="fixed inset-x-0 z-50 px-3 pb-6 sm:px-4"
            style={{ top: menuOffset, height: menuHeight }}
          >
            <nav
              id="global-menu"
              className={`mx-auto flex h-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl border backdrop-blur-2xl shadow-2xl ${
                dark
                  ? 'border-white/20 bg-slate-900/80 text-slate-100'
                  : 'border-white/60 bg-white/90 text-slate-900'
              }`}
              style={{ padding: '1.25rem', paddingBottom: menuPaddingBottom }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{headerT('navigationLabel')}</p>
                  <p className="mt-1 text-sm font-semibold">
                    {isAuthenticated
                      ? headerT('greeting', {
                          name: user?.username ?? headerT('userFallbackName'),
                        })
                      : headerT('menu')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  className={`rounded-full p-2 transition-colors ${dark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
                  aria-label={headerT('closeMenuAria')}
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {isAuthenticated ? (
                <div className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${dark ? 'border-white/15 bg-white/5 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{user?.email ?? headerT('loggedInFallback')}</p>
                    <p className="text-xs text-slate-400">{user?.user_type === 'seller' ? headerT('userType.seller') : headerT('userType.default')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${dark ? 'bg-white/10 text-red-200 hover:bg-white/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                    {layoutT('logout')}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    dark ? 'border border-white/30 bg-white/10 text-white hover:bg-white/20' : 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {layoutT('guest.login')}
                </Link>
              )}

              <div className="flex flex-col gap-4">
                {isAdminUser && (
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className={`flex items-center justify-between gap-2 rounded-full px-4 py-3 text-sm font-bold transition-colors ${
                      dark
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-600 hover:to-orange-600'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                      <span>{navT('links.admin')}</span>
                    </span>
                  </Link>
                )}
                
                {navGroups.map((group) => {
                  const meta = getDashboardNavGroupMeta(group.key, navT);
                  return (
                    <div key={group.key} className="flex flex-col gap-2">
                      <span
                        className={`px-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${meta.headingClass}`}
                      >
                        {meta.label}
                      </span>
                      <div className="flex flex-col gap-2">
                        {group.items.map((link) => {
                          const isActive = isDashboardLinkActive(pathname, link.href);
                          const linkProps = link.external
                            ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                            : { href: link.href };
                          const styles = getDashboardNavClasses(link, { variant: 'mobile', active: isActive });

                          return (
                            <Link
                              key={link.href}
                              {...linkProps}
                              onClick={closeMenu}
                              className={`flex items-center justify-between gap-2 rounded-full px-4 py-2 text-xs font-semibold ${styles.container}`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span className={`flex h-4 w-4 items-center justify-center ${styles.icon}`}>
                                  {link.icon}
                                </span>
                                <span className="truncate">{link.label}</span>
                              </span>
                              {link.badge ? (
                                <span className={`ml-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${styles.badge}`}>
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

              <div className={`${dark ? 'text-slate-400' : 'text-slate-500'} text-[10px]`}>© D-swipe</div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
