"use client";

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import DSwipeLogo from '@/components/DSwipeLogo';
import { useAuthStore } from '@/store/authStore';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: (props: React.ComponentProps<'svg'>) => ReactNode;
  description?: string;
  badge?: string;
};

export type AdminPageTab = {
  id: string;
  label: string;
  icon?: (props: React.ComponentProps<'svg'>) => ReactNode;
};

export interface AdminShellProps {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  navItems?: AdminNavItem[];
  activeTab?: string;
  tabs?: AdminPageTab[];
  onTabChange?: (tabId: string) => void;
  headerActions?: ReactNode;
  className?: string;
}

const DEFAULT_NAV_ITEMS: AdminNavItem[] = [
  {
    href: '/admin',
    label: 'ダッシュボード',
    icon: ChartBarIcon,
    description: '管理全体の指標と審査案件を確認',
  },
  {
    href: '/admin/share-management',
    label: 'NOTEシェア運用',
    icon: ShareIcon,
    description: 'シェア報酬・ログ・不正検知の管理',
  },
  {
    href: '/admin/line-settings',
    label: 'LINE連携ボーナス',
    icon: MegaphoneIcon,
    description: '公式LINEキャンペーン設定',
  },
  {
    href: '/settings',
    label: 'アカウント設定',
    icon: Cog6ToothIcon,
  },
];

const mobileNavButtonClass =
  'flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:border-blue-500 hover:bg-blue-50/70 transition-colors';

export default function AdminShell({
  children,
  pageTitle,
  pageSubtitle,
  navItems = DEFAULT_NAV_ITEMS,
  activeTab,
  tabs,
  onTabChange,
  headerActions,
  className,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const resolvedNavItems = useMemo(() => navItems, [navItems]);

  const currentNav = useMemo(() => {
    return resolvedNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  }, [pathname, resolvedNavItems]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 text-gray-900', className)}>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
          <div className="flex h-20 items-center gap-3 border-b border-gray-200 px-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <DSwipeLogo size="medium" showFullName textColor="text-gray-900" />
            </Link>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</span>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
            {resolvedNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-2xl border px-4 py-3 shadow-sm transition-all',
                    isActive
                      ? 'border-blue-500 bg-blue-50 shadow-blue-100'
                      : 'border-transparent bg-white hover:border-blue-400 hover:bg-blue-50/60'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 px-6 py-5 text-sm text-gray-500">
            <p className="font-semibold text-gray-700">運営チームの皆さまへ</p>
            <p className="mt-1 text-xs">この管理画面からNOTE・サロンの審査／通報対応・メンテナンス運用を統合的に行えます。</p>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
              aria-label="管理メニューを開く"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">管理者パネル</span>
              <span className="text-xs text-gray-500">{currentNav?.label ?? 'ダッシュボード'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            {user && (
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {isMobileNavOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-40 bg-gray-900/50" onClick={() => setMobileNavOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-full flex-col border-r border-gray-200 bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                <div className="flex items-center gap-3">
                  <DSwipeLogo size="small" showFullName textColor="text-gray-900" />
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
                {resolvedNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(mobileNavButtonClass, isActive && 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm')}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p>{item.label}</p>
                        {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              {user && (
                <div className="border-t border-gray-200 px-4 py-4 text-sm text-gray-500">
                  <p className="font-semibold text-gray-800">{user.username}</p>
                  <p className="text-xs">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
              {pageSubtitle && <p className="mt-1 text-sm text-gray-500">{pageSubtitle}</p>}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              {headerActions}
              <div className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{user?.username ?? 'Admin'}</span>
                <span className="ml-2 text-xs text-gray-500">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                ログアウト
              </button>
            </div>
          </div>

          {tabs && tabs.length > 0 && (
            <div className="border-b border-gray-200 bg-white px-4 lg:px-6">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange?.(tab.id)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                        isActive ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
