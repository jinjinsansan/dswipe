'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pubnav-bl" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0b1f3a" />
      <path d="M11 13h6c4 0 7 2.8 7 7s-3 7-7 7h-6z" fill="none" stroke="url(#pubnav-bl)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M25 20l6-5m-6 5l6 5" stroke="url(#pubnav-bl)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LINKS = [{ href: '/products', label: 'マーケット' }];

/** Sticky public top navigation for marketplace / product / creator pages. */
export default function PublicNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-[14px]"
      style={{ background: 'rgba(255,255,255,.85)', borderColor: 'var(--line)' }}
    >
      <div className="mx-auto flex h-[60px] max-w-[1140px] items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          <BrandMark />
          <span>
            D<span style={{ color: 'var(--brand)' }}>-</span>Swipe
          </span>
        </Link>

        <div className="ml-2 hidden gap-0.5 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-[9px] px-3 py-2 text-[13.5px] font-semibold transition-colors"
              style={isActive(l.href) ? { color: 'var(--brand)', background: 'var(--surface-tint)' } : { color: 'var(--text-2)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hidden rounded-[9px] px-3 py-2 text-[13.5px] font-semibold sm:inline-flex" style={{ color: 'var(--text-2)' }}>
                ダッシュボード
              </Link>
              <Link href="/dashboard" className="avatar" aria-label="ダッシュボード">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-[9px] px-3 py-2 text-[13.5px] font-semibold sm:inline-flex" style={{ color: 'var(--text-2)' }}>
                ログイン
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                無料で始める
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] sm:hidden"
            style={{ color: 'var(--ink)' }}
            aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t px-4 py-3 sm:hidden" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={cn('rounded-[9px] px-3 py-2 text-sm font-semibold')}
                style={isActive(l.href) ? { color: 'var(--brand)', background: 'var(--surface-tint)' } : { color: 'var(--text)' }}
              >
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-[9px] px-3 py-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>
                ログイン
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
