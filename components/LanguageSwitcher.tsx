
'use client';

import { useTransition, type ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const LOCALE_PREFIX = '/en';
const EN_SUPPORTED_PREFIXES = ['/notes'];

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const stripLocalePrefix = (pathname: string) => {
  if (pathname.startsWith(LOCALE_PREFIX)) {
    const stripped = pathname.slice(LOCALE_PREFIX.length) || '/';
    return ensureLeadingSlash(stripped);
  }
  return pathname || '/';
};

const usesEnglishPathPrefix = (pathname: string) => {
  const base = ensureLeadingSlash(stripLocalePrefix(pathname));
  return EN_SUPPORTED_PREFIXES.some((prefix) => base === prefix || base.startsWith(`${prefix}/`));
};

function resolvePathname(pathname: string, targetLocale: 'ja' | 'en') {
  const safePath = pathname || '/';
  if (targetLocale === 'en') {
    if (safePath.startsWith(LOCALE_PREFIX)) {
      return safePath;
    }
    if (usesEnglishPathPrefix(safePath)) {
      return `${LOCALE_PREFIX}${ensureLeadingSlash(stripLocalePrefix(safePath))}`;
    }
    return ensureLeadingSlash(stripLocalePrefix(safePath));
  }

  if (safePath.startsWith(LOCALE_PREFIX)) {
    return stripLocalePrefix(safePath);
  }

  return safePath;
}

export default function LanguageSwitcher() {
  const locale = useLocale() as 'ja' | 'en';
  const t = useTranslations('common.languageSwitcher');
  const router = useRouter();
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { user, setUser } = useAuthStore();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as 'ja' | 'en';
    if (nextLocale === locale) return;

    const nextPath = resolvePathname(pathname, nextLocale);
    const queryString = searchParams?.toString();
    const href = queryString ? `${nextPath}?${queryString}` : nextPath;
    const currentHref = queryString ? `${pathname}?${queryString}` : pathname;

    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;

    if (user) {
      (async () => {
        try {
          const response = await authApi.updateProfile({ preferred_locale: nextLocale });
          const updatedUser = response.data;
          setUser(updatedUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to update preferred locale', error);
          }
        }
      })();
    }

    startTransition(() => {
      if (href === currentHref) {
        router.refresh();
      } else {
        router.push(href);
      }
    });
  };

  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
      <span>{t('label')}</span>
      <select
        value={locale}
        onChange={handleChange}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        disabled={isPending}
      >
        <option value="ja">{t('localeName.ja')}</option>
        <option value="en">{t('localeName.en')}</option>
      </select>
    </label>
  );
}
