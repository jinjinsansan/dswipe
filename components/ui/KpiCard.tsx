import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface KpiCardProps {
  icon?: React.ReactNode;
  /** Use the soft (tinted) icon style instead of the gradient fill. */
  softIcon?: boolean;
  caption: string;
  value: React.ReactNode;
  delta?: { value: string; direction: 'up' | 'down' };
  /** Neutral footer line (used when there is no up/down delta). */
  foot?: React.ReactNode;
  className?: string;
}

/** KPI metric card for dashboards/analytics. */
export function KpiCard({ icon, softIcon, caption, value, delta, foot, className }: KpiCardProps) {
  return (
    <Card padded={false} className={cn('kpi', className)}>
      <div className="kpi-top">
        {icon && <span className={cn('kpi-ico', softIcon && 'soft')}>{icon}</span>}
        <span className="kpi-cap">{caption}</span>
      </div>
      <div className="kpi-val">{value}</div>
      {delta ? (
        <span className={cn('kpi-delta', delta.direction)}>{delta.value}</span>
      ) : foot ? (
        <span className="kpi-delta" style={{ color: 'var(--muted)' }}>{foot}</span>
      ) : null}
    </Card>
  );
}
