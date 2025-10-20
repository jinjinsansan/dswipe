export interface DashboardNavLink {
  href: string;
  label: string;
  icon: string;
}

export const BASE_DASHBOARD_NAV_LINKS: DashboardNavLink[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { href: '/lp/create', label: '新規LP作成', icon: '➕' },
  { href: '/products', label: 'マーケット', icon: '🏪' },
  { href: '/points/purchase', label: 'ポイント購入', icon: '💰' },
  { href: '/media', label: 'メディア', icon: '🖼️' },
];

export const getDashboardNavLinks = (options?: { isAdmin?: boolean; userType?: string }): DashboardNavLink[] => {
  const links = [...BASE_DASHBOARD_NAV_LINKS];

  if (options?.userType === 'seller' && !links.some((link) => link.href === '/products/manage')) {
    links.splice(2, 0, { href: '/products/manage', label: '商品管理', icon: '🛠️' });
  }

  if (options?.isAdmin) {
    links.push({ href: '/admin', label: '管理者パネル', icon: '🛡️' });
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
