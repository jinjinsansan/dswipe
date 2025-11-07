import {createLocalizedPathnamesNavigation, Pathnames} from 'next-intl/navigation';

export const locales = ['ja', 'en'] as const;

export const localePrefix = 'as-needed';

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/notes': '/notes',
  '/notes/[slug]': '/notes/[slug]',
  '/notes/[slug]/purchase/success': '/notes/[slug]/purchase/success',
  '/points/purchase': '/points/purchase',
  '/points/purchase/success': '/points/purchase/success',
  '/points/purchase/error': '/points/purchase/error',
};

export type AppLocale = (typeof locales)[number];

export const {Link, redirect, usePathname, useRouter} = createLocalizedPathnamesNavigation({
  locales,
  localePrefix,
  pathnames,
});
