
'use client';

import { useTransition, type ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const LOCALE_PREFIX = '/en';

function resolvePathname(pathname: string, targetLocale: 'ja' | 'en') {
  if (targetLocale === 'en') {
    if (pathname === '/' || pathname === '') {
      return LOCALE_PREFIX;
    }
    if (pathname.startsWith(LOCALE_PREFIX)) {
      return pathname;
    }
    return `${LOCALE_PREFIX}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  }

  if (pathname.startsWith(LOCALE_PREFIX)) {
    const stripped = pathname.slice(LOCALE_PREFIX.length) || '/';
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }

  return pathname || '/';
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
      router.push(href);
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
