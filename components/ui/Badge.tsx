import React from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'live' | 'draft' | 'seller' | 'pro' | 'warn' | 'danger';

const toneClass: Record<BadgeTone, string> = {
  live: 'badge-live',
  draft: 'badge-draft',
  seller: 'badge-seller',
  pro: 'badge-pro',
  warn: 'badge-warn',
  danger: 'badge-danger',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  small?: boolean;
  /** Show the leading status dot. */
  dot?: boolean;
}

/** Momentum status badge. */
export function Badge({ tone = 'draft', small, dot, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn('badge', toneClass[tone], small && 'badge-sm', className)} {...props}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
