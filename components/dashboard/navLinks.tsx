import {
  ChartBarIcon,
  Square2StackIcon,
  BuildingStorefrontIcon,
  CurrencyYenIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

export interface DashboardNavLink {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
}

export const BASE_DASHBOARD_NAV_LINKS: DashboardNavLink[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: <ChartBarIcon className="h-5 w-5" aria-hidden="true" /> },
  { href: '/lp/create', label: '新規LP作成', icon: <Square2StackIcon className="h-5 w-5" aria-hidden="true" /> },
  { href: '/products', label: 'マーケット', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" /> },
  { href: '/points/purchase', label: 'ポイント購入', icon: <CurrencyYenIcon className="h-5 w-5" aria-hidden="true" /> },
  { href: '/points/history', label: 'ポイント履歴', icon: <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" /> },
  { href: '/line/bonus', label: 'LINE連携で300P', icon: <GiftIcon className="h-5 w-5" aria-hidden="true" />, badge: '300P' },
  { href: '/media', label: 'メディア', icon: <PhotoIcon className="h-5 w-5" aria-hidden="true" /> },
];

export const getDashboardNavLinks = (options?: { isAdmin?: boolean; userType?: string }): DashboardNavLink[] => {
  const links = [...BASE_DASHBOARD_NAV_LINKS];

  if (options?.userType === 'seller' && !links.some((link) => link.href === '/products/manage')) {
    links.splice(2, 0, { href: '/products/manage', label: '商品管理', icon: <WrenchScrewdriverIcon className="h-5 w-5" aria-hidden="true" /> });
  }

  if (options?.isAdmin) {
    links.push({ href: '/admin', label: '管理者パネル', icon: <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" /> });
  }
  return links;
};

export const isDashboardLinkActive = (pathname: string, href: string) => {
  if (href === '/dashboard') {
    return pathname === href;
  }

  if (href === '/products') {
    if (pathname === href) return true;
    return /^\/products\/(?!manage)/.test(pathname);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};
