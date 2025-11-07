import {cookies, headers} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './routing';

async function resolveLocaleFromPath(): Promise<(typeof locales)[number] | undefined> {
  const requestHeaders = await headers();
  const hostname = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? '';
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https';
  const urlHeader = requestHeaders.get('x-middleware-request-url');

  try {
    const url = urlHeader ? new URL(urlHeader) : new URL(`${protocol}://${hostname}`);
    const pathname = url.pathname;
    if (pathname.startsWith('/en/')) {
      return 'en';
    }
    if (pathname === '/en') {
      return 'en';
    }
  } catch (error) {
    // ignore malformed URLs
  }

  return undefined;
}

export default getRequestConfig(async ({locale}) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const pathLocale = await resolveLocaleFromPath();
  const requestedLocale = cookieLocale ?? pathLocale ?? locale;

  const resolvedLocale: (typeof locales)[number] = locales.includes(
    requestedLocale as (typeof locales)[number]
  )
    ? (requestedLocale as (typeof locales)[number])
    : 'ja';
  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;

  return {
    locale: resolvedLocale,
    messages,
  };
});
