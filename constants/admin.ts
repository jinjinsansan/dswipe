export const ADMIN_EMAIL_WHITELIST = [
  'goldbenchan@gmail.com',
  'kusanokiyoshi1@gmail.com',
] as const;

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAIL_WHITELIST.includes(email as (typeof ADMIN_EMAIL_WHITELIST)[number]);
};
