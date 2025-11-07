import {
  ChartBarIcon,
  Square2StackIcon,
  BuildingStorefrontIcon,
  CurrencyYenIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
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
  ShareIcon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { XLogo } from '@/components/icons/XLogo';

type TranslateFn = (key: string) => string;

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
  labelKey?: string;
  badgeKey?: string;
}

type DashboardNavLinkDefinition = {
  href: string;
  labelKey: string;
  defaultLabel: string;
  icon: ReactNode;
  group: DashboardNavGroupKey;
  order?: number;
  badgeKey?: string;
  defaultBadge?: string;
  external?: boolean;
};

type DashboardNavGroupMetaConfig = {
  labelKey: string;
  defaultLabel: string;
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

export type DashboardNavGroupMeta = {
  label: string;
  headingClass: string;
  desktop: DashboardNavGroupMetaConfig['desktop'];
  mobile: DashboardNavGroupMetaConfig['mobile'];
};

const GROUP_ORDER: DashboardNavGroupKey[] = ['core', 'lp', 'note', 'salon', 'points', 'line', 'media', 'info'];

const GROUP_META_CONFIG: Record<DashboardNavGroupKey, DashboardNavGroupMetaConfig> = {
  core: {
    labelKey: 'groups.core',
    defaultLabel: 'ホーム',
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
    labelKey: 'groups.lp',
    defaultLabel: 'LPメニュー',
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
    labelKey: 'groups.note',
    defaultLabel: 'NOTEメニュー',
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
    labelKey: 'groups.salon',
    defaultLabel: 'サロン',
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
    labelKey: 'groups.points',
    defaultLabel: 'ポイント',
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
    labelKey: 'groups.line',
    defaultLabel: 'LINE連携',
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
    labelKey: 'groups.media',
    defaultLabel: '外部連携',
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
    labelKey: 'groups.info',
    defaultLabel: 'サポート',
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

const BASE_NAV_LINK_DEFINITIONS: DashboardNavLinkDefinition[] = [
  { href: '/dashboard', labelKey: 'links.dashboard', defaultLabel: 'ダッシュボード', icon: <ChartBarIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 0 },
  { href: '/messages', labelKey: 'links.messages', defaultLabel: '運営からのお知らせ', icon: <MegaphoneIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 15 },
  { href: '/profile', labelKey: 'links.profile', defaultLabel: 'プロフィール', icon: <UserCircleIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 5 },
  { href: '/lp/create', labelKey: 'links.lpCreate', defaultLabel: '新規LP作成', icon: <Square2StackIcon className="h-5 w-5" aria-hidden="true" />, group: 'lp', order: 10 },
  { href: '/products', labelKey: 'links.products', defaultLabel: 'AllLP', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />, group: 'lp', order: 30 },
  { href: '/note/create', labelKey: 'links.noteCreate', defaultLabel: '新規NOTE作成', icon: <DocumentPlusIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 10 },
  { href: '/note', labelKey: 'links.noteEdit', defaultLabel: 'NOTE編集', icon: <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 20 },
  { href: '/notes', labelKey: 'links.notes', defaultLabel: 'AllNOTES', icon: <BookOpenIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 30 },
  { href: '/salons', labelKey: 'links.salons', defaultLabel: 'サロン一覧', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 10 },
  { href: '/salons/create', labelKey: 'links.salonsCreate', defaultLabel: 'サロン新規作成', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 20 },
  { href: '/salons/all', labelKey: 'links.salonsAll', defaultLabel: 'AllSalon', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 30 },
  { href: '/points/purchase', labelKey: 'links.pointsPurchase', defaultLabel: 'ポイント購入', icon: <CurrencyYenIcon className="h-5 w-5" aria-hidden="true" />, group: 'points', order: 10 },
  { href: '/points/history', labelKey: 'links.pointsHistory', defaultLabel: 'ポイント履歴', icon: <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />, group: 'points', order: 20 },
  { href: '/purchases', labelKey: 'links.purchases', defaultLabel: '購入履歴', icon: <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />, group: 'points', order: 25 },
  { href: '/line/bonus', labelKey: 'links.lineBonus', defaultLabel: 'LINE連携', icon: <GiftIcon className="h-5 w-5" aria-hidden="true" />, group: 'line', order: 10, badgeKey: 'links.lineBonusBadge', defaultBadge: '300P' },
  { href: '/settings', labelKey: 'links.settings', defaultLabel: 'X連携', icon: <XLogo className="h-5 w-5" aria-hidden="true" />, group: 'media', order: 25 },
  { href: '/settings/share', labelKey: 'links.settingsShare', defaultLabel: '共有機能', icon: <ShareIcon className="h-5 w-5" aria-hidden="true" />, group: 'media', order: 30 },
  { href: '/media', labelKey: 'links.media', defaultLabel: 'メディア', icon: <PhotoIcon className="h-5 w-5" aria-hidden="true" />, group: 'media', order: 10 },
  { href: '/terms', labelKey: 'links.terms', defaultLabel: '利用規約', icon: <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 10 },
  { href: '/tokusho', labelKey: 'links.tokusho', defaultLabel: '特定商取引法', icon: <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 15 },
  { href: '/privacy', labelKey: 'links.privacy', defaultLabel: 'プライバシー', icon: <LockClosedIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 20 },
  { href: 'https://lin.ee/lYIZWhd', labelKey: 'links.contact', defaultLabel: 'お問い合わせ', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />, group: 'info', order: 40, external: true },
];

const safeTranslate = (translate: TranslateFn | undefined, key: string, fallback: string) => {
  if (!translate) {
    return fallback;
  }
  try {
    const value = translate(key);
    if (!value || value === key) {
      return fallback;
    }
    return value;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Missing translation for key: ${key}`);
    }
    return fallback;
  }
};

const createNavLink = (definition: DashboardNavLinkDefinition, translate?: TranslateFn): DashboardNavLink => {
  return {
    href: definition.href,
    label: safeTranslate(translate, definition.labelKey, definition.defaultLabel),
    icon: definition.icon,
    group: definition.group,
    order: definition.order,
    external: definition.external,
    badge: definition.badgeKey
      ? safeTranslate(translate, definition.badgeKey, definition.defaultBadge ?? '')
      : definition.defaultBadge,
    labelKey: definition.labelKey,
    badgeKey: definition.badgeKey,
  };
};

export const getDashboardNavLinks = (options?: {
  isAdmin?: boolean;
  userType?: string;
  unreadMessageCount?: number;
  translate?: TranslateFn;
}): DashboardNavLink[] => {
  const translate = options?.translate;
  const links: DashboardNavLink[] = BASE_NAV_LINK_DEFINITIONS.map((definition) => createNavLink(definition, translate));

  if (options?.userType === 'seller' && !links.some((link) => link.href === '/products/manage')) {
    links.push(
      createNavLink(
        {
          href: '/products/manage',
          labelKey: 'links.productsManage',
          defaultLabel: '商品管理',
          icon: <WrenchScrewdriverIcon className="h-5 w-5" aria-hidden="true" />,
          group: 'lp',
          order: 20,
        },
        translate,
      ),
    );
  }

  if (options?.userType === 'seller' && !links.some((link) => link.href === '/sales')) {
    links.push(
      createNavLink(
        {
          href: '/sales',
          labelKey: 'links.sales',
          defaultLabel: '販売履歴',
          icon: <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />,
          group: 'points',
          order: 22,
        },
        translate,
      ),
    );
  }

  if (options?.isAdmin && !links.some((link) => link.href === '/admin')) {
    links.push(
      createNavLink(
        {
          href: '/admin',
          labelKey: 'links.admin',
          defaultLabel: '管理者パネル',
          icon: <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />,
          group: 'core',
          order: 50,
        },
        translate,
      ),
    );
  }

  const unreadCount = options?.unreadMessageCount ?? 0;
  if (links.some((link) => link.href === '/messages')) {
    const badgeLabel = unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : undefined;
    links.forEach((link) => {
      if (link.href === '/messages') {
        link.badge = badgeLabel;
      }
    });
  }

  return links;
};

export interface DashboardNavGroup {
  key: DashboardNavGroupKey;
  label: string;
  items: DashboardNavLink[];
}

export const groupDashboardNavLinks = (
  links: DashboardNavLink[],
  options?: { translate?: TranslateFn; locale?: string }
): DashboardNavGroup[] => {
  const translate = options?.translate;
  const locale = options?.locale ?? 'ja';
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });

  return GROUP_ORDER.map((group) => {
    const items = links
      .filter((link) => link.group === group)
      .sort((a, b) => {
        const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return collator.compare(a.label, b.label);
      });

    if (items.length === 0) {
      return null;
    }

    const meta = getDashboardNavGroupMeta(group, translate);

    return {
      key: group,
      label: meta.label,
      items,
    };
  }).filter((group): group is DashboardNavGroup => Boolean(group));
};

export const getDashboardNavGroupMeta = (
  group: DashboardNavGroupKey,
  translate?: TranslateFn
): DashboardNavGroupMeta => {
  const config = GROUP_META_CONFIG[group];
  return {
    label: safeTranslate(translate, config.labelKey, config.defaultLabel),
    headingClass: config.headingClass,
    desktop: config.desktop,
    mobile: config.mobile,
  };
};

export const getDashboardNavClasses = (
  link: DashboardNavLink,
  options: { variant: 'desktop' | 'mobile'; active: boolean }
) => {
  const meta = GROUP_META_CONFIG[link.group];
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
