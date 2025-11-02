import type { AppRouterInstance } from 'next/navigation';

const DEFAULT_REDIRECT = '/dashboard';

export const buildLoginRedirectUrl = (path?: string) => {
  const basePath = (() => {
    if (path && path.trim().length > 0) {
      return path;
    }
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return DEFAULT_REDIRECT;
  })();

  const normalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return `/login?redirect=${encodeURIComponent(normalized)}`;
};

export const redirectToLogin = (router: AppRouterInstance, path?: string) => {
  router.push(buildLoginRedirectUrl(path));
};
