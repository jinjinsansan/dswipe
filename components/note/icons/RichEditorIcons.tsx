'use client';

import type { SVGProps } from 'react';

export function BoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 4.75A.75.75 0 017.75 4h4.5a3.75 3.75 0 012.168 6.8A3.75 3.75 0 0113.75 20h-6A.75.75 0 017 19.25V4.75zm1.5.75v5h3.75a2.25 2.25 0 000-4.5H8.5zm0 6.5v6h4.25a2.5 2.5 0 000-5H8.5z" />
    </svg>
  );
}

export function ItalicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9.25 4A.75.75 0 0110 3.25h8a.75.75 0 010 1.5h-3.053l-3.894 14H16a.75.75 0 010 1.5H8.25a.75.75 0 010-1.5h3.053l3.894-14H10A.75.75 0 019.25 4z" />
    </svg>
  );
}

interface HeadingIconProps extends SVGProps<SVGSVGElement> {
  label?: string;
}

export function HeadingIcon({ label = 'H', ...props }: HeadingIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.25 4A.75.75 0 017 4.75V11h10V4.75a.75.75 0 011.5 0v14.5a.75.75 0 01-1.5 0V12.5H7v6.75a.75.75 0 01-1.5 0V4.75A.75.75 0 016.25 4z" />
      <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">{label}</text>
    </svg>
  );
}

export function ListBulletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5-.75a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM6 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5-.75a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9zM6 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5-.75a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" />
    </svg>
  );
}
