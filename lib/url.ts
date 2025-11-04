export const resolveButtonUrl = (url?: string | null): string => {
  if (typeof url !== 'string') {
    return '/link/unset';
  }

  const trimmed = url.trim();

  if (!trimmed || trimmed === '#') {
    return '/link/unset';
  }

  return trimmed;
};
