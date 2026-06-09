'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { getDashboardNavLinks, isDashboardLinkActive } from '@/components/dashboard/navLinks';
import { cn } from '@/lib/utils';

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="shell-bl" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#fff" fillOpacity=".08" stroke="rgba(255,255,255,.2)" />
      <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#shell-bl)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M25 20l6-5m-6 5l6 5" stroke="url(#shell-bl)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SECONDARY_HREFS = new Set(['/points/purchase', '/media']);

export interface DashboardShellProps {
  title: string;
  subtitle?: string;
  /** Optional actions rendered on the right side of the topbar. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared app chrome: navy sidebar + topbar + mobile drawer (Momentum). */
export default function DashboardShell({ title, subtitle, actions, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = getDashboardNavLinks({ isAdmin, userType: user?.user_type });
  const primary = navLinks.filter((l) => !SECONDARY_HREFS.has(l.href));
  const secondary = navLinks.filter((l) => SECONDARY_HREFS.has(l.href));

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const renderNavItem = (link: (typeof navLinks)[number]) => {
    const active = isDashboardLinkActive(pathname, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setDrawerOpen(false)}
        className={cn('side-item', active && 'active')}
      >
        {link.icon}
        <span>{link.label}</span>
      </Link>
    );
  };

  const sidebar = (
    <aside className="side h-full">
      <div className="side-logo">
        <BrandMark />
        <span className="ml-2 text-[17px] font-extrabold text-white">
          D<span style={{ color: 'var(--cyan-400)' }}>-</span>Swipe
        </span>
      </div>
      <nav className="side-nav">
        <div className="side-sect">メイン</div>
        {primary.map(renderNavItem)}
        {secondary.length > 0 && <div className="side-sect">その他</div>}
        {secondary.map(renderNavItem)}
      </nav>
      <div className="side-foot">
        <div className="mb-2 flex items-center gap-2.5 rounded-[12px] p-2">
          <div className="avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold leading-tight text-white">{user?.username}</div>
            <div className="mt-0.5 text-[11px]" style={{ color: 'var(--on-navy-muted)' }}>
              {user?.user_type}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-[12px] border px-3 py-2 text-[12.5px] font-semibold transition-colors"
          style={{ color: '#fca5a5', background: 'rgba(248,113,113,.1)', borderColor: 'rgba(248,113,113,.18)' }}
        >
          ログアウト
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--canvas)', color: 'var(--text)' }}>
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(7,15,30,.5)] lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-screen transition-transform lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebar}
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="topbar sticky top-0 z-30">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="-ml-1 p-1.5 lg:hidden"
              aria-label="メニューを開く"
              style={{ color: 'var(--ink)' }}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--ink)' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 truncate text-[12.5px]" style={{ color: 'var(--muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </header>

        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
