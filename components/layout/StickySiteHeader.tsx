'use client';

import Link from 'next/link';
import DSwipeLogo from '@/components/DSwipeLogo';
import type { ReactNode } from 'react';

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

  return (
    <header className={headerClassName}>
      <div className={containerClassName}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <DSwipeLogo size="small" showFullName textColor={textColor} />
          </Link>
          {showDashboardLink ? (
            <Link
              href="/dashboard"
              className={dashboardLinkClassName}
            >
              Dashboard
            </Link>
          ) : null}
        </div>
        {rightSlot}
      </div>
    </header>
  );
}
