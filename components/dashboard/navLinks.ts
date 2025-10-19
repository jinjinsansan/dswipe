export interface DashboardNavLink {
  href: string;
  label: string;
  icon: string;
}

export const DASHBOARD_NAV_LINKS: DashboardNavLink[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { href: '/lp/create', label: '新規LP作成', icon: '➕' },
  { href: '/products', label: 'マーケット', icon: '🏪' },
  { href: '/points/purchase', label: 'ポイント購入', icon: '💰' },
  { href: '/media', label: 'メディア', icon: '🖼️' },
];

export const isDashboardLinkActive = (pathname: string, href: string) => {
  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname.startsWith(href);
};
