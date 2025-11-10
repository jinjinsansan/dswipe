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

const stripLocalePrefix = (pathname: string, locale: string) => {
  const prefix = `/${locale}`;
  if (pathname === prefix) {
    return '/';
  }
  if (pathname.startsWith(`${prefix}/`)) {
    const stripped = pathname.slice(prefix.length);
    return stripped.length ? stripped : '/';
  }
  return null;
};

const stripEnglishPrefix = (pathname: string) => stripLocalePrefix(pathname, 'en') ?? pathname;

const isWithinSupportedEnglishNamespace = (pathname: string) =>
  SUPPORTED_EN_PREFIXES.some((prefix) => pathname === `/en${prefix}` || pathname.startsWith(`/en${prefix}/`));

const normalizeDefaultLocaleRewrite = (request: NextRequest, response: NextResponse) => {
  const rewriteHeader = response.headers.get('x-middleware-rewrite');
  if (!rewriteHeader) {
    return;
  }

  const rewriteUrl = new URL(rewriteHeader, request.nextUrl);
  const stripped = stripLocalePrefix(rewriteUrl.pathname, 'ja');
  if (!stripped) {
    return;
  }

  rewriteUrl.pathname = stripped;
  if (rewriteUrl.pathname === request.nextUrl.pathname && rewriteUrl.search === request.nextUrl.search) {
    response.headers.delete('x-middleware-rewrite');
    return;
  }

  response.headers.set('x-middleware-rewrite', `${rewriteUrl.pathname}${rewriteUrl.search}`);
};

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;

  normalizeDefaultLocaleRewrite(request, response);

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
