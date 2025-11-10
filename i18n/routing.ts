import {createNavigation} from 'next-intl/navigation';
import type {Pathnames} from 'next-intl/routing';

export const locales = ['ja', 'en'] as const;

export const localePrefix = 'as-needed';

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/notes': '/notes',
  '/notes/[slug]': '/notes/[slug]',
  '/notes/[slug]/purchase/success': '/notes/[slug]/purchase/success',
  '/points/purchase': '/points/purchase',
  '/points/payment-methods': '/points/payment-methods',
  '/points/payment-methods/success': '/points/payment-methods/success',
  '/points/payment-methods/error': '/points/payment-methods/error',
  '/points/purchase/success': '/points/purchase/success',
  '/points/purchase/error': '/points/purchase/error',
};

export type AppLocale = (typeof locales)[number];

export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  localePrefix,
  pathnames,
});
