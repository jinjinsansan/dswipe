import {NextRequest, NextResponse} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import {locales, localePrefix, pathnames} from './i18n/routing';

const SUPPORTED_EN_PREFIXES = ['/notes'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ja',
  localePrefix,
  pathnames,
});

const stripEnglishPrefix = (pathname: string) => pathname.slice(3) || '/';

const isWithinSupportedEnglishNamespace = (pathname: string) =>
  SUPPORTED_EN_PREFIXES.some((prefix) => pathname === `/en${prefix}` || pathname.startsWith(`/en${prefix}/`));

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/en/') && !isWithinSupportedEnglishNamespace(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = stripEnglishPrefix(pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_static|_vercel|.*\.[^/]+).*)',
  ],
};
