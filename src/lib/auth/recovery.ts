export const RECOVERY_COOKIE_NAME = 'mitenya-password-recovery';
export const RECOVERY_COOKIE_PATH = '/auth/reset-password';
export const RECOVERY_COOKIE_MAX_AGE = 15 * 60;

export const getRecoveryCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: RECOVERY_COOKIE_PATH,
  maxAge: RECOVERY_COOKIE_MAX_AGE,
});
