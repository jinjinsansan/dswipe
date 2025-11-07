import {NextRequest, NextResponse} from 'next/server';

const SUPPORTED_LOCALES = new Set(['ja', 'en']);
const PUBLIC_FILE = /\.[^/]+$/;
const LOCALE_PREFIX = '/en';

function resolvePreferredLocale(request: NextRequest): 'ja' | 'en' {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.has(cookieLocale)) {
    return cookieLocale as 'ja' | 'en';
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const [primary] = acceptLanguage.split(',');
    const code = primary?.split('-')[0]?.trim();
    if (code && SUPPORTED_LOCALES.has(code)) {
      return code as 'ja' | 'en';
    }
  }

  return 'ja';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith(LOCALE_PREFIX)) {
    return NextResponse.next();
  }

  const preferredLocale = resolvePreferredLocale(request);

  if (preferredLocale === 'en') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? LOCALE_PREFIX : `${LOCALE_PREFIX}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/notes/:path*',
    '/points/purchase/:path*',
    '/notes/share/:path*',
    '/en/notes/:path*',
    '/en/points/purchase/:path*',
  ],
};
