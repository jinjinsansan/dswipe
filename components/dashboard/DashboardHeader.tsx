'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DSwipeLogo from '@/components/DSwipeLogo';
import {
  type DashboardNavGroupKey,
  getDashboardNavLinks,
  getDashboardNavGroupMeta,
  groupDashboardNavLinks,
  isDashboardLinkActive,
} from '@/components/dashboard/navLinks';

const MOBILE_LABEL_MAP: Record<string, string> = {
  '/dashboard': 'ダッシュ',
  '/lp/create': '新規LP',
  '/products': 'マーケット',
  '/products/manage': '商品管理',
  '/sales': '販売履歴',
  '/notes': 'NOTE一覧',
  '/note/create': '新規NOTE',
  '/purchases': '購入履歴',
  '/purchases?type=seller': '販売履歴',
  '/points/history': 'PT履歴',
  '/points/purchase': 'PT購入',
  '/points/subscriptions': '自動チャージ',
  '/salons': 'サロン一覧',
  '/salons/create': 'サロン作成',
  '/salons/all': '公開サロン',
  '/media': 'メディア',
  '/line/bonus': 'LINE連携',
  '/settings': '設定',
  '/admin': '管理',
  '/terms': '利用規約',
  '/privacy': 'プライバシー',
};

const getCompactLabel = (href: string, fallback: string) => {
  if (MOBILE_LABEL_MAP[href]) {
    return MOBILE_LABEL_MAP[href];
  }
  if (fallback.length <= 6) {
    return fallback;
  }
  return fallback.replace('新規', '新').slice(0, 6);
};

const MOBILE_GROUP_PILL_CLASSES: Record<DashboardNavGroupKey, string> = {
  core: 'bg-slate-100 text-slate-600 border border-transparent',
  lp: 'bg-blue-100 text-blue-700 border border-transparent',
  note: 'bg-slate-200 text-slate-600 border border-transparent',
  salon: 'bg-sky-100 text-sky-700 border border-transparent',
  points: 'bg-violet-100 text-violet-700 border border-transparent',
  line: 'bg-emerald-100 text-emerald-700 border border-transparent',
  media: 'bg-indigo-100 text-indigo-700 border border-transparent',
  info: 'bg-slate-100 text-slate-500 border border-transparent',
};

const MOBILE_GROUP_PILL_ACTIVE_CLASS = 'bg-white/20 text-white border border-white/30';

const MOBILE_GROUP_CARD_CLASSES: Record<DashboardNavGroupKey, string> = {
  core: 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300',
  lp: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300',
  note: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300',
  salon: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300',
  points: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300',
  line: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
  media: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300',
  info: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300',
};

const MOBILE_GROUP_ICON_CLASSES: Record<DashboardNavGroupKey, string> = {
  core: 'bg-white/70 text-slate-600',
  lp: 'bg-white/70 text-blue-600',
  note: 'bg-white/70 text-slate-600',
  salon: 'bg-white/70 text-sky-600',
  points: 'bg-white/70 text-violet-600',
  line: 'bg-white/70 text-emerald-600',
  media: 'bg-white/70 text-indigo-600',
  info: 'bg-white/70 text-slate-500',
};

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
  const isAdmin = user?.user_type === 'admin';
  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const navGroups = groupDashboardNavLinks(navLinks);
  const flatMobileLinks = useMemo(
    () =>
      navGroups.flatMap((group) => {
        const meta = getDashboardNavGroupMeta(group.key);
        const pillClass = MOBILE_GROUP_PILL_CLASSES[group.key] ?? 'bg-slate-100 text-slate-600 border border-transparent';
        return group.items.map((link) => ({
          link,
          groupKey: group.key,
          groupLabel: meta.label,
          pillClass,
        }));
      }),
    [navGroups]
  );
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
              {flatMobileLinks.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {flatMobileLinks.map(({ link, groupKey, groupLabel, pillClass }) => {
                    const isActive = isDashboardLinkActive(pathname, link.href);
                    const linkProps = link.external
                      ? { href: link.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                      : { href: link.href };
                    const label = getCompactLabel(link.href, link.label);
                    const cardClass = MOBILE_GROUP_CARD_CLASSES[groupKey] ?? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';
                    const iconClass = MOBILE_GROUP_ICON_CLASSES[groupKey] ?? 'bg-white/70 text-slate-600';

                    return (
                      <Link
                        key={`${groupKey}-${link.href}`}
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
                          {groupLabel}
                        </span>
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            isActive ? 'bg-white/15 text-white' : iconClass
                          }`}
                        >
                          {link.icon}
                        </span>
                        <span className="mb-1 text-center text-[11px] leading-tight">
                          {label}
                        </span>
                      </Link>
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
