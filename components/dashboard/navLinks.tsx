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
  DocumentTextIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  DocumentPlusIcon,
  PencilSquareIcon,
  BookOpenIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { XLogo } from '@/components/icons/XLogo';

export type DashboardNavGroupKey =
  | 'core'
  | 'lp'
  | 'note'
  | 'salon'
  | 'points'
  | 'line'
  | 'media'
  | 'info';

export interface DashboardNavLink {
  href: string;
  label: string;
  icon: ReactNode;
  group: DashboardNavGroupKey;
  order?: number;
  badge?: string;
  external?: boolean;
}

type DashboardNavGroupMeta = {
  label: string;
  headingClass: string;
  desktop: {
    base: string;
    active: string;
    icon: string;
    iconActive: string;
    badge: string;
    badgeActive?: string;
  };
  mobile: {
    base: string;
    active: string;
    badge: string;
    badgeActive?: string;
  };
};

const GROUP_ORDER: DashboardNavGroupKey[] = ['core', 'lp', 'note', 'salon', 'points', 'line', 'media', 'info'];

const GROUP_META: Record<DashboardNavGroupKey, DashboardNavGroupMeta> = {
  core: {
    label: 'ホーム',
    headingClass: 'text-slate-500',
    desktop: {
      base: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      active: 'bg-slate-900 text-white shadow-sm',
      icon: 'text-slate-500',
      iconActive: 'text-white',
      badge: 'bg-white/70 text-slate-600 border border-slate-200/70',
    },
    mobile: {
      base: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
      active: 'bg-slate-900 text-white shadow-sm',
      badge: 'bg-white/70 text-inherit',
    },
  },
  lp: {
    label: 'LPメニュー',
    headingClass: 'text-blue-500',
    desktop: {
      base: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100',
      active: 'bg-blue-600 text-white border border-blue-600 shadow-sm',
      icon: 'text-blue-500',
      iconActive: 'text-white',
      badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    },
    mobile: {
      base: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      active: 'bg-blue-600 text-white shadow-sm',
      badge: 'bg-white/80 text-blue-600',
    },
  },
  note: {
    label: 'NOTEメニュー',
    headingClass: 'text-slate-500',
    desktop: {
      base: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100',
      active: 'bg-slate-500 text-white border border-slate-500 shadow-sm',
      icon: 'text-slate-500',
      iconActive: 'text-white',
      badge: 'bg-white text-slate-600 border border-slate-200',
    },
    mobile: {
      base: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      active: 'bg-slate-500 text-white shadow-sm',
      badge: 'bg-white/80 text-slate-600',
    },
  },
  salon: {
    label: 'サロン',
    headingClass: 'text-sky-500',
    desktop: {
      base: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100',
      active: 'bg-sky-500 text-white border border-sky-500 shadow-sm',
      icon: 'text-sky-500',
      iconActive: 'text-white',
      badge: 'bg-white text-sky-600 border border-sky-200',
    },
    mobile: {
      base: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
      active: 'bg-sky-500 text-white shadow-sm',
      badge: 'bg-white/80 text-sky-600',
    },
  },
  points: {
    label: 'ポイント',
    headingClass: 'text-violet-500',
    desktop: {
      base: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100',
      active: 'bg-violet-500 text-white border border-violet-500 shadow-sm',
      icon: 'text-violet-500',
      iconActive: 'text-white',
      badge: 'bg-violet-100 text-violet-700 border border-violet-200',
    },
    mobile: {
      base: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
      active: 'bg-violet-500 text-white shadow-sm',
      badge: 'bg-white/80 text-violet-600',
    },
  },
  line: {
    label: 'LINE連携',
    headingClass: 'text-emerald-500',
    desktop: {
      base: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
      active: 'bg-emerald-500 text-white border border-emerald-500 shadow-sm',
      icon: 'text-emerald-500',
      iconActive: 'text-white',
      badge: 'bg-white text-emerald-600 border border-emerald-200',
      badgeActive: 'bg-white text-emerald-600 border border-emerald-200',
    },
    mobile: {
      base: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
      active: 'bg-emerald-500 text-white shadow-sm border border-emerald-500',
      badge: 'bg-white text-emerald-600',
      badgeActive: 'bg-white text-emerald-600',
    },
  },
  media: {
    label: '外部連携',
    headingClass: 'text-indigo-500',
    desktop: {
      base: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100',
      active: 'bg-indigo-500 text-white border border-indigo-500 shadow-sm',
      icon: 'text-indigo-500',
      iconActive: 'text-white',
      badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    },
    mobile: {
      base: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      active: 'bg-indigo-500 text-white shadow-sm',
      badge: 'bg-white/80 text-indigo-600',
    },
  },
  info: {
    label: 'サポート',
    headingClass: 'text-slate-400',
    desktop: {
      base: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100',
      active: 'bg-slate-500 text-white border border-slate-500 shadow-sm',
      icon: 'text-slate-500',
      iconActive: 'text-white',
      badge: 'bg-white/80 text-slate-600 border border-slate-200',
    },
    mobile: {
      base: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      active: 'bg-slate-500 text-white shadow-sm',
      badge: 'bg-white/70 text-slate-600',
    },
  },
};

export const BASE_DASHBOARD_NAV_LINKS: DashboardNavLink[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: <ChartBarIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 0 },
  { href: '/profile', label: 'プロフィール', icon: <UserCircleIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 5 },
  { href: '/lp/create', label: '新規LP作成', icon: <Square2StackIcon className="h-5 w-5" aria-hidden="true" />, group: 'lp', order: 10 },
  { href: '/products', label: 'マーケット', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />, group: 'lp', order: 30 },
  { href: '/note/create', label: '新規NOTE作成', icon: <DocumentPlusIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 10 },
  { href: '/note', label: 'NOTE編集', icon: <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 20 },
  { href: '/notes', label: 'AllNOTE', icon: <BookOpenIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 30 },
  { href: '/salons', label: 'サロン一覧', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 10 },
  { href: '/salons/create', label: 'サロン新規作成', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 20 },
  { href: '/salons/all', label: 'AllSalon', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 30 },
  { href: '/points/purchase', label: 'ポイント購入', icon: <CurrencyYenIcon className="h-5 w-5" aria-hidden="true" />, group: 'points', order: 10 },
  { href: '/points/history', label: 'ポイント履歴', icon: <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />, group: 'points', order: 20 },
  { href: '/purchases', label: '購入履歴', icon: <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />, group: 'points', order: 25 },
  { href: '/line/bonus', label: 'LINE連携', icon: <GiftIcon className="h-5 w-5" aria-hidden="true" />, group: 'line', order: 10, badge: '300P' },
  { href: '/settings', label: 'X連携', icon: <XLogo className="h-5 w-5" aria-hidden="true" />, group: 'media', order: 25 },
  { href: '/media', label: 'メディア', icon: <PhotoIcon className="h-5 w-5" aria-hidden="true" />, group: 'media', order: 10 },
  { href: '/terms', label: '利用規約', icon: <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 10 },
  { href: '/tokusho', label: '特定商取引法', icon: <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 15 },
  { href: '/privacy', label: 'プライバシー', icon: <LockClosedIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 20 },
  { href: 'https://www.dlogicai.in/', label: '競馬予想AIDlogic', icon: <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 30, external: true },
  { href: 'https://lin.ee/lYIZWhd', label: 'お問い合わせ', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 40, external: true },
];

export const getDashboardNavLinks = (options?: { isAdmin?: boolean; userType?: string }): DashboardNavLink[] => {
  const links = [...BASE_DASHBOARD_NAV_LINKS];

  if (options?.userType === 'seller' && !links.some((link) => link.href === '/products/manage')) {
    const productsManageLink: DashboardNavLink = {
      href: '/products/manage',
      label: '商品管理',
      icon: <WrenchScrewdriverIcon className="h-5 w-5" aria-hidden="true" />,
      group: 'lp',
      order: 20,
    };
    links.push(productsManageLink);
  }

  if (options?.userType === 'seller' && !links.some((link) => link.href === '/sales')) {
    links.push({
      href: '/sales',
      label: '販売履歴',
      icon: <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />,
      group: 'points',
      order: 22,
    });
  }

  if (options?.isAdmin && !links.some((link) => link.href === '/admin')) {
    links.push({
      href: '/admin',
      label: '管理者パネル',
      icon: <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />,
      group: 'core',
      order: 50,
    });
  }

  return links;
};

export interface DashboardNavGroup {
  key: DashboardNavGroupKey;
  label: string;
  items: DashboardNavLink[];
}

export const groupDashboardNavLinks = (links: DashboardNavLink[]): DashboardNavGroup[] => {
  return GROUP_ORDER.map((group) => {
    const items = links
      .filter((link) => link.group === group)
      .sort((a, b) => {
        const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.label.localeCompare(b.label, 'ja');
      });
    if (items.length === 0) {
      return null;
    }
    return {
      key: group,
      label: GROUP_META[group].label,
      items,
    };
  }).filter((group): group is DashboardNavGroup => Boolean(group));
};

export const getDashboardNavGroupMeta = (group: DashboardNavGroupKey): DashboardNavGroupMeta => GROUP_META[group];

export const getDashboardNavClasses = (
  link: DashboardNavLink,
  options: { variant: 'desktop' | 'mobile'; active: boolean }
) => {
  const meta = GROUP_META[link.group];
  if (options.variant === 'desktop') {
    return {
      container: options.active ? meta.desktop.active : meta.desktop.base,
      icon: options.active ? meta.desktop.iconActive : meta.desktop.icon,
      badge: options.active && meta.desktop.badgeActive ? meta.desktop.badgeActive : meta.desktop.badge,
    };
  }

  return {
    container: options.active ? meta.mobile.active : meta.mobile.base,
    icon: options.active ? meta.desktop.iconActive : meta.desktop.icon,
    badge: options.active && meta.mobile.badgeActive ? meta.mobile.badgeActive : meta.mobile.badge,
  };
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
