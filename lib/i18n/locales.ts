export type Locale = 'ja' | 'en';

export const SUPPORTED_LOCALES: readonly Locale[] = ['ja', 'en'] as const;

export const DEFAULT_LOCALE: Locale = 'ja';

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === 'ja' || value === 'en';
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
