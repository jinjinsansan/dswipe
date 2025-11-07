import {NextRequest, NextResponse} from 'next/server';

const SUPPORTED_LOCALES = new Set(['ja', 'en']);
const PUBLIC_FILE = /\.[^/]+$/;
const LOCALE_PREFIX = '/en';
const DEFAULT_LOCALE: 'ja' = 'ja';

const SUPPORTED_EN_PREFIX = '/notes';

function normalizeCookieLocale(value: string | undefined) {
  if (!value) return undefined;
  return SUPPORTED_LOCALES.has(value) ? (value as 'ja' | 'en') : undefined;
}

function buildPrefixedPath(pathname: string) {
  if (pathname === '/' || pathname === '') {
    return LOCALE_PREFIX;
  }
  return `${LOCALE_PREFIX}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const cookieLocale = normalizeCookieLocale(request.cookies.get('NEXT_LOCALE')?.value);
  const isEnglishPath = pathname.startsWith(LOCALE_PREFIX);
  const normalizedPath = isEnglishPath ? pathname.slice(LOCALE_PREFIX.length) || '/' : pathname;
  const isSupportedPath = normalizedPath.startsWith(SUPPORTED_EN_PREFIX);

  if (isEnglishPath) {
    const response = NextResponse.next();
    if (cookieLocale !== 'en') {
      response.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
    }
    return response;
  }

  if (cookieLocale === 'en' && isSupportedPath) {
    const url = request.nextUrl.clone();
    url.pathname = buildPrefixedPath(pathname);
    const response = NextResponse.redirect(url);
    response.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const response = NextResponse.next();
  if (!cookieLocale) {
    response.cookies.set('NEXT_LOCALE', DEFAULT_LOCALE, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/en/notes/:path*'],
};
