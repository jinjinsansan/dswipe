'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Square2StackIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import DSwipeLogo from '@/components/DSwipeLogo';
import {
  type DashboardNavGroupKey,
  getDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';
import { useOperatorMessageStore } from '@/store/operatorMessageStore';
import { AccountSwitcher } from '@/components/account/AccountSwitcher';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const KNOWN_SITE_ORIGINS = [
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : undefined,
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FRONTEND_URL : undefined,
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL : undefined,
].filter((value): value is string => Boolean(value));

const isExternalHref = (href: string): boolean => {
  if (!href || !href.startsWith('http')) {
    return false;
  }

  try {
    const url = new URL(href);

    if (typeof window !== 'undefined' && window.location?.host) {
      if (url.host === window.location.host) {
        return false;
      }
    }

    for (const origin of KNOWN_SITE_ORIGINS) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host === url.host) {
          return false;
        }
      } catch (error) {
        // 解析失敗時はスキップ
      }
    }

    return true;
  } catch (error) {
    return true;
  }
};

const getCompactLabel = (fallback: string) => {
  if (fallback.length <= 8) {
    return fallback;
  }
  return fallback.slice(0, 8);
};

const MOBILE_GROUP_PILL_CLASSES: Record<DashboardNavGroupKey, string> = {
  core: 'bg-slate-200 text-slate-600 border border-transparent',
  lp: 'bg-sky-100 text-sky-700 border border-transparent',
  note: 'bg-rose-100 text-rose-700 border border-transparent',
  salon: 'bg-amber-100 text-amber-700 border border-transparent',
  points: 'bg-violet-100 text-violet-700 border border-transparent',
  line: 'bg-emerald-100 text-emerald-700 border border-transparent',
  media: 'bg-orange-100 text-orange-700 border border-transparent',
  info: 'bg-white text-slate-500 border border-slate-200',
};

const MOBILE_GROUP_PILL_ACTIVE_CLASS = 'bg-white/20 text-white border border-white/30';

const MOBILE_GROUP_CARD_CLASSES: Record<DashboardNavGroupKey, string> = {
  core: 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300',
  lp: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300',
  note: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300',
  salon: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300',
  points: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300',
  line: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
  media: 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300',
  info: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
};

const MOBILE_GROUP_ICON_CLASSES: Record<DashboardNavGroupKey, string> = {
  core: 'bg-white/70 text-slate-600',
  lp: 'bg-white/70 text-sky-600',
  note: 'bg-white/70 text-rose-600',
  salon: 'bg-white/70 text-amber-600',
  points: 'bg-white/70 text-violet-600',
  line: 'bg-white/70 text-emerald-600',
  media: 'bg-white/70 text-orange-600',
  info: 'bg-white/70 text-slate-500',
};

const ADMIN_EMAILS = new Set([
  'goldbenchan@gmail.com',
  'kusanokiyoshi1@gmail.com',
]);

interface DashboardHeaderProps {
  user: any;
  pointBalance: number;
  pageTitle?: string;
  pageSubtitle?: string;
  isBalanceLoading?: boolean;
  requireAuth?: boolean;
  onLogout: () => void;
}

export default function DashboardHeader({
  user,
  pointBalance,
  pageTitle,
  pageSubtitle,
  isBalanceLoading = false,
  requireAuth = true,
  onLogout,
}: DashboardHeaderProps) {
  const navT = useTranslations('dashboard.navigation');
  const layoutT = useTranslations('dashboard.layout');
  const headerT = useTranslations('dashboard.header');
  const pathname = usePathname();
  const isAdmin = user?.user_type === 'admin';
  const { unreadCount } = useOperatorMessageStore();
  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type, unreadMessageCount: unreadCount, translate: navT });
  const navLinkMap = useMemo(() => {
    const map = new Map<string, (typeof navLinks)[number]>();
    navLinks.forEach((link) => {
      map.set(link.href, link);
    });
    return map;
  }, [navLinks]);
  const resolvedPageTitle = pageTitle ?? layoutT('defaultTitle');

  type MobileMenuItem =
    | { kind: 'link'; href: string; groupOverride?: DashboardNavGroupKey; labelOverride?: string }
    | { kind: 'customLink'; key: string; href: string; label: string; icon: ReactNode; groupKey: DashboardNavGroupKey; external?: boolean }
    | { kind: 'logout'; key: string; label: string; icon: ReactNode; groupKey: DashboardNavGroupKey }
    | { kind: 'disabled'; key: string; label: string; icon: ReactNode; groupKey: DashboardNavGroupKey };

  type MobileMenuSection = {
    label: string;
    defaultGroup: DashboardNavGroupKey;
    items: MobileMenuItem[];
  };

  const mobileSections = useMemo<MobileMenuSection[]>(() => {
    if (!user) {
      return [];
    }

    const resolveIcon = (href: string, fallback: ReactNode) => navLinkMap.get(href)?.icon ?? fallback;
    const notificationsCountLabel = unreadCount > 99 ? '99+' : String(unreadCount);

    return [
      {
        label: headerT('sections.home'),
        defaultGroup: 'core',
        items: [
          {
            kind: 'customLink',
            key: 'home-top',
            href: '/',
            label: headerT('links.home'),
            icon: <HomeIcon className="h-6 w-6" aria-hidden="true" />, 
            groupKey: 'core',
          },
          {
            kind: 'link',
            href: '/dashboard',
            groupOverride: 'core',
            labelOverride: headerT('links.dashboardShort'),
          },
          {
            kind: 'customLink',
            key: 'messages',
            href: '/messages',
            label: unreadCount > 0 ? headerT('notificationsWithCount', { count: notificationsCountLabel }) : headerT('notifications'),
            icon: resolveIcon('/messages', <MegaphoneIcon className="h-6 w-6" aria-hidden="true" />),
            groupKey: 'core',
          },
        ],
      },
      {
        label: navT('groups.lp'),
        defaultGroup: 'lp',
        items: [
          {
            kind: 'customLink',
            key: 'lp-create',
            href: '/lp/create',
            label: navT('links.lpCreate'),
            icon: resolveIcon('/lp/create', <Square2StackIcon className="h-6 w-6" aria-hidden="true" />),
            groupKey: 'lp',
          },
          {
            kind: 'customLink',
            key: 'products-manage',
            href: '/products/manage',
            label: navT('links.productsManage'),
            icon: resolveIcon('/products/manage', <WrenchScrewdriverIcon className="h-6 w-6" aria-hidden="true" />),
            groupKey: 'lp',
          },
          {
            kind: 'customLink',
            key: 'products-market',
            href: '/products',
            label: navT('links.products'),
            icon: resolveIcon('/products', <BuildingStorefrontIcon className="h-6 w-6" aria-hidden="true" />),
            groupKey: 'lp',
          },
        ],
      },
      {
        label: navT('groups.note'),
        defaultGroup: 'note',
        items: [
          { kind: 'link', href: '/note/create', groupOverride: 'note' },
          { kind: 'link', href: '/note', groupOverride: 'note' },
          { kind: 'link', href: '/notes', groupOverride: 'note' },
        ],
      },
      {
        label: navT('groups.salon'),
        defaultGroup: 'salon',
        items: [
          { kind: 'link', href: '/salons/create', groupOverride: 'salon' },
          { kind: 'link', href: '/salons', groupOverride: 'salon' },
          { kind: 'link', href: '/salons/all', groupOverride: 'salon' },
        ],
      },
      {
        label: navT('groups.points'),
        defaultGroup: 'points',
        items: [
          { kind: 'link', href: '/points/purchase', groupOverride: 'points' },
          { kind: 'link', href: '/points/history', groupOverride: 'points' },
          { kind: 'link', href: '/purchases', groupOverride: 'points' },
        ],
      },
      {
        label: headerT('sections.settings'),
        defaultGroup: 'line',
        items: [
          { kind: 'link', href: '/profile', groupOverride: 'line' },
          { kind: 'link', href: '/line/bonus', groupOverride: 'line' },
          { kind: 'link', href: '/settings', groupOverride: 'line' },
          {
            kind: 'customLink',
            key: 'account-share',
            href: '/settings/share',
            label: navT('links.settingsShare'),
            icon: resolveIcon('/settings/share', <ShareIcon className="h-6 w-6" aria-hidden="true" />),
            groupKey: 'line' as DashboardNavGroupKey,
          },
          {
            kind: 'customLink',
            key: 'sales-history',
            href: '/sales',
            label: navT('links.sales'),
            icon: resolveIcon('/sales', <ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" />),
            groupKey: 'line' as DashboardNavGroupKey,
          },
          ...(ADMIN_EMAILS.has(user.email ?? '')
            ? [
                {
                  kind: 'customLink' as const,
                  key: 'admin-panel',
                  href: '/admin',
                  label: navT('links.admin'),
                  icon: resolveIcon('/admin', <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />),
                  groupKey: 'line' as DashboardNavGroupKey,
                },
              ]
            : []),
        ],
      },
      {
        label: navT('groups.info'),
        defaultGroup: 'info',
        items: [
          { kind: 'link', href: '/terms', groupOverride: 'info' },
          { kind: 'link', href: '/tokusho', groupOverride: 'info' },
          { kind: 'link', href: '/privacy', groupOverride: 'info' },
        ],
      },
      {
        label: headerT('sections.more'),
        defaultGroup: 'media',
        items: [
          { kind: 'link', href: 'https://lin.ee/lYIZWhd', groupOverride: 'info' },
          { kind: 'link', href: '/media', groupOverride: 'media' },
          {
            kind: 'logout',
            key: 'logout',
            label: layoutT('logout'),
            icon: <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />, 
            groupKey: 'info' as DashboardNavGroupKey,
          },
        ],
      },
    ];
  }, [headerT, layoutT, navLinks, navLinkMap, navT, unreadCount, user]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [menuTopOffset, setMenuTopOffset] = useState(0);
  const originalBodyOverflow = useRef<string>('');

  const subtitle = pageSubtitle || (user ? headerT('subtitle', { name: user?.username ?? headerT('userFallbackName') }) : '');
  const formattedPointBalance = `${pointBalance.toLocaleString()} P`;
  const menuOffset = menuTopOffset || 112;
  const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)';
  const menuHeight = `calc(100vh - ${menuOffset}px - ${safeAreaBottom} - 64px)`;
  const menuPaddingBottom = `calc(3rem + ${safeAreaBottom})`;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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
  }, [isMenuOpen, resolvedPageTitle, subtitle]);

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
              <DSwipeLogo size="large" showFullName={true} textColor="text-slate-900" />
            </Link>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-0 truncate">{resolvedPageTitle}</h1>
              <p className="text-slate-500 text-xs">{subtitle}</p>
            </div>
            <div className="sm:hidden min-w-0">
              <h1 className="text-base font-semibold text-slate-900 truncate">{resolvedPageTitle}</h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                <AccountSwitcher />
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded border border-slate-200 min-w-[150px] justify-between">
                  <span className="text-slate-500 text-xs font-medium">{headerT('pointBalanceLabel')}</span>
                  {renderBalanceValue()}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-sm shadow-sm">
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt={headerT('avatarAlt')} className="w-full h-full object-cover" />
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
                  {layoutT('guest.login')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  {layoutT('guest.register')}
                </Link>
              </div>
            )}
          </div>

          <div className="sm:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            {user ? (
              <>
                <AccountSwitcher className="flex-1" buttonClassName="w-full" />
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
                    <img src={user.profile_image_url} alt={headerT('avatarAlt')} className="w-full h-full object-cover" />
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
                {layoutT('guest.login')}
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
            <span>{headerT('menu')}</span>
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
              {mobileSections.length > 0 && (
                <div className="flex flex-col gap-3">
                  {mobileSections.map((section) => {
                    const items: (MobileMenuItem | null)[] = [...section.items];
                    while (items.length % 3 !== 0) {
                      items.push(null);
                    }

                    return (
                      <div key={section.label} className="grid grid-cols-3 gap-2">
                        {items.map((item, index) => {
                          if (!item) {
                            return (
                              <div
                                key={`${section.label}-placeholder-${index}`}
                                aria-hidden="true"
                                className="aspect-square rounded-3xl"
                              />
                            );
                          }

                          if (item.kind === 'link') {
                            const navLink = navLinkMap.get(item.href);
                            if (!navLink) {
                              return (
                                <div
                                  key={`${section.label}-missing-${index}`}
                                  aria-hidden="true"
                                  className="aspect-square rounded-3xl"
                                />
                              );
                            }

                            const isActive = !navLink.external && isDashboardLinkActive(pathname, navLink.href);
                            const groupKey = item.groupOverride ?? navLink.group ?? section.defaultGroup;
                            const cardClass = MOBILE_GROUP_CARD_CLASSES[groupKey] ?? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
                            const iconClass = MOBILE_GROUP_ICON_CLASSES[groupKey] ?? 'bg-white/70 text-slate-600';
                            const pillClass = MOBILE_GROUP_PILL_CLASSES[groupKey] ?? 'bg-slate-100 text-slate-600 border border-transparent';
                            const label = item.labelOverride ?? getCompactLabel(navLink.label);
                            const linkProps = navLink.external
                              ? { href: navLink.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                              : { href: navLink.href };

                            return (
                              <Link
                                key={`${section.label}-${navLink.href}`}
                                {...linkProps}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex aspect-square flex-col items-center justify-between rounded-3xl px-3 py-3 text-xs font-semibold transition-all ${
                                  isActive
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                                    : cardClass
                                }`}
                              >
                                <span
                                  className={`mt-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                    isActive ? MOBILE_GROUP_PILL_ACTIVE_CLASS : pillClass
                                  }`}
                                >
                                  {section.label}
                                </span>
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                    isActive ? 'bg-white/15 text-white' : iconClass
                                  }`}
                                >
                                  {navLink.icon}
                                </span>
                                <span className="mb-1 text-center text-[11px] leading-tight">
                                  {label}
                                </span>
                              </Link>
                            );
                          }

                          if (item.kind === 'customLink') {
                            const isExternal = item.external ?? isExternalHref(item.href);
                            const isActive = !isExternal && pathname === item.href;
                            const groupKey = item.groupKey;
                            const cardClass = MOBILE_GROUP_CARD_CLASSES[groupKey] ?? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
                            const iconClass = MOBILE_GROUP_ICON_CLASSES[groupKey] ?? 'bg-white/70 text-slate-600';
                            const pillClass = MOBILE_GROUP_PILL_CLASSES[groupKey] ?? 'bg-slate-100 text-slate-600 border border-transparent';

                            return (
                              <Link
                                key={`${section.label}-${item.key}`}
                                href={item.href}
                                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex aspect-square flex-col items-center justify-between rounded-3xl px-3 py-3 text-xs font-semibold transition-all ${
                                  isActive
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                                    : cardClass
                                }`}
                              >
                                <span
                                  className={`mt-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                    isActive ? MOBILE_GROUP_PILL_ACTIVE_CLASS : pillClass
                                  }`}
                                >
                                  {section.label}
                                </span>
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                    isActive ? 'bg-white/15 text-white' : iconClass
                                  }`}
                                >
                                  {item.icon}
                                </span>
                                <span className="mb-1 text-center text-[11px] leading-tight">
                                  {item.label}
                                </span>
                              </Link>
                            );
                          }

                          if (item.kind === 'logout') {
                            const groupKey = item.groupKey;
                            const cardClass = MOBILE_GROUP_CARD_CLASSES[groupKey] ?? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
                            const iconClass = MOBILE_GROUP_ICON_CLASSES[groupKey] ?? 'bg-white/70 text-slate-600';
                            const pillClass = MOBILE_GROUP_PILL_CLASSES[groupKey] ?? 'bg-slate-100 text-slate-600 border border-transparent';

                            return (
                              <button
                                key={`${section.label}-${item.key}`}
                                type="button"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  onLogout();
                                }}
                                className={`flex aspect-square flex-col items-center justify-between rounded-3xl px-3 py-3 text-xs font-semibold transition-all ${cardClass}`}
                              >
                                <span className={`mt-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${pillClass}`}>
                                  {section.label}
                                </span>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconClass}`}>
                                  {item.icon}
                                </span>
                                <span className="mb-1 text-center text-[11px] leading-tight">
                                  {item.label}
                                </span>
                              </button>
                            );
                          }

                          if (item.kind === 'disabled') {
                            const groupKey = item.groupKey;
                            const cardClass = MOBILE_GROUP_CARD_CLASSES[groupKey] ?? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
                            const iconClass = MOBILE_GROUP_ICON_CLASSES[groupKey] ?? 'bg-white/70 text-slate-600';
                            const pillClass = MOBILE_GROUP_PILL_CLASSES[groupKey] ?? 'bg-slate-100 text-slate-600 border border-transparent';

                            return (
                              <div
                                key={`${section.label}-${item.key}`}
                                className={`${cardClass} flex aspect-square flex-col items-center justify-between rounded-3xl px-3 py-3 text-xs font-semibold opacity-60`}
                              >
                                <span
                                  className={`mt-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${pillClass}`}
                                >
                                  {section.label}
                                </span>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconClass}`}>
                                  {item.icon}
                                </span>
                                <span className="mb-1 text-center text-[11px] leading-tight">
                                  {item.label}
                                </span>
                              </div>
                            );
                          }

                          return null;
                        })}
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
