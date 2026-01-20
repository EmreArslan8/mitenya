export const ensureCsrfToken = (): string => {
  if (typeof window === 'undefined') return '';

  const existing = getCsrfTokenFromCookie();
  if (existing) return existing;

  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(16).slice(2) + Date.now().toString(16);

  document.cookie = `csrf_token=${token}; Path=/; Max-Age=1800; SameSite=Lax`;
  return token;
};

export const getCsrfTokenFromCookie = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === 'csrf_token')?.[1];
};

export const withCsrfHeaders = (init: RequestInit = {}): RequestInit => {
  const token = ensureCsrfToken();
  return {
    ...init,
    headers: {
      ...(init.headers || {}),
      'x-csrf-token': token,
    },
  };
};
