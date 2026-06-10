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
};

type DashboardNavStyleSet = {
  base: string;
  active: string;
  icon: string;
  iconActive: string;
  badge: string;
  badgeActive?: string;
};

export type DashboardNavGroupMeta = {
  label: string;
  headingClass: string;
  desktop: DashboardNavStyleSet;
  mobile: DashboardNavStyleSet;
};

export const GROUP_ORDER: DashboardNavGroupKey[] = ['core', 'lp', 'note', 'salon', 'points', 'line', 'media', 'info'];

const GROUP_META_CONFIG: Record<DashboardNavGroupKey, DashboardNavGroupMetaConfig> = {
  core: { labelKey: 'groups.core', defaultLabel: 'ホーム' },
  lp: { labelKey: 'groups.lp', defaultLabel: 'LPメニュー' },
  note: { labelKey: 'groups.note', defaultLabel: 'コラム' },
  salon: { labelKey: 'groups.salon', defaultLabel: 'サロン' },
  points: { labelKey: 'groups.points', defaultLabel: 'ポイント' },
  line: { labelKey: 'groups.line', defaultLabel: 'LINE連携' },
  media: { labelKey: 'groups.media', defaultLabel: '外部連携' },
  info: { labelKey: 'groups.info', defaultLabel: 'サポート' },
};

const SALON_ENABLED = process.env.NEXT_PUBLIC_SALON_FEATURE_ENABLED === 'true';

const BASE_NAV_LINK_DEFINITIONS: DashboardNavLinkDefinition[] = [
  { href: '/dashboard', labelKey: 'links.dashboard', defaultLabel: 'ダッシュボード', icon: <ChartBarIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 0 },
  { href: '/messages', labelKey: 'links.messages', defaultLabel: '運営からのお知らせ', icon: <MegaphoneIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 15 },
  { href: '/profile', labelKey: 'links.profile', defaultLabel: 'プロフィール', icon: <UserCircleIcon className="h-5 w-5" aria-hidden="true" />, group: 'core', order: 5 },
  { href: '/lp/create', labelKey: 'links.lpCreate', defaultLabel: '新規LP作成', icon: <Square2StackIcon className="h-5 w-5" aria-hidden="true" />, group: 'lp', order: 10 },
  { href: '/products', labelKey: 'links.products', defaultLabel: 'AllLP', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />, group: 'lp', order: 30 },
  { href: '/note/create', labelKey: 'links.noteCreate', defaultLabel: '新規コラム作成', icon: <DocumentPlusIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 10 },
  { href: '/note', labelKey: 'links.noteEdit', defaultLabel: 'コラム編集', icon: <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 20 },
  { href: '/notes', labelKey: 'links.notes', defaultLabel: 'AllColums', icon: <BookOpenIcon className="h-5 w-5" aria-hidden="true" />, group: 'note', order: 30 },
  ...(SALON_ENABLED ? [
    { href: '/salons', labelKey: 'links.salons', defaultLabel: 'サロン編集', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 10 } as DashboardNavLinkDefinition,
    { href: '/salons/joined', labelKey: 'links.salonsJoined', defaultLabel: '加入中のサロン', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 15 } as DashboardNavLinkDefinition,
    { href: '/salons/create', labelKey: 'links.salonsCreate', defaultLabel: 'サロン新規作成', icon: <UserGroupIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 20 } as DashboardNavLinkDefinition,
    { href: '/salons/all', labelKey: 'links.salonsAll', defaultLabel: 'AllSalon', icon: <BuildingStorefrontIcon className="h-5 w-5" aria-hidden="true" />, group: 'salon', order: 30 } as DashboardNavLinkDefinition,
  ] : []),
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

// Momentum navy sidebar: every group's desktop nav item uses one navy/cyan style.
const NAVY_DESKTOP_NAV: DashboardNavStyleSet = {
  base: 'text-[var(--on-navy-muted)] hover:bg-white/[0.06] hover:text-[var(--on-navy)]',
  active: 'bg-cyan-500/15 text-[var(--brand-cyan-soft)] shadow-[inset_2px_0_0_var(--brand-cyan)]',
  icon: 'text-[var(--on-navy-muted)]',
  iconActive: 'text-[var(--brand-cyan)]',
  badge: 'bg-white/10 text-[#cfe3f5] border border-white/10',
  badgeActive: 'bg-white/15 text-pure-white',
};

// Momentum light mobile menu: one unified style for every group
// (white card + sky accent; active = navy). text-pure-white is required on
// navy because globals.css remaps .text-white to a dark color.
const MOMENTUM_MOBILE_NAV: DashboardNavStyleSet = {
  base: 'bg-white text-slate-700 border border-[#e2ebf6] hover:border-[#bfe6fb] hover:bg-sky-50',
  active: 'bg-[#0b1f3a] text-pure-white shadow-sm',
  icon: 'text-sky-600',
  iconActive: 'text-[var(--brand-cyan)]',
  badge: 'bg-[#e9f6fe] text-sky-700',
  badgeActive: 'bg-white/15 text-pure-white',
};

export const getDashboardNavGroupMeta = (
  group: DashboardNavGroupKey,
  translate?: TranslateFn
): DashboardNavGroupMeta => {
  const config = GROUP_META_CONFIG[group];
  return {
    label: safeTranslate(translate, config.labelKey, config.defaultLabel),
    // Muted heading for the navy sidebar (light surfaces should override).
    headingClass: 'text-[var(--on-navy-muted)]',
    desktop: NAVY_DESKTOP_NAV,
    mobile: MOMENTUM_MOBILE_NAV,
  };
};

export const getDashboardNavClasses = (
  link: DashboardNavLink,
  options: { variant: 'desktop' | 'mobile'; active: boolean }
) => {
  const styles = options.variant === 'desktop' ? NAVY_DESKTOP_NAV : MOMENTUM_MOBILE_NAV;
  return {
    container: options.active ? styles.active : styles.base,
    icon: options.active ? styles.iconActive : styles.icon,
    badge: options.active && styles.badgeActive ? styles.badgeActive : styles.badge,
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
