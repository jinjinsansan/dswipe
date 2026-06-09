import React from 'react';
import { cn } from '@/lib/utils';

/** Circular avatar with brand gradient fallback (initial). */
export function Avatar({
  name,
  src,
  className,
  ...props
}: { name?: string; src?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('avatar', className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ''} className="h-full w-full rounded-full object-cover" />
      ) : (
        (name?.charAt(0) ?? 'U').toUpperCase()
      )}
    </div>
  );
}

/** Point balance pill. */
export function PointsPill({ value, className }: { value: number; className?: string }) {
  return <span className={cn('points', className)}>{value.toLocaleString()} P</span>;
}

/** Toggle switch. Controlled via `checked` + `onChange`. */
export function Switch({
  checked,
  onChange,
  className,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn('switch', checked && 'on', className)}
    />
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/** Segmented control (tab-like switch). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('segmented', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(value === opt.value && 'active')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
