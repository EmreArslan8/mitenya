const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export default isValidUrl;

/**
 * Redirect hedefinin güvenli bir site-içi path olduğunu doğrular.
 * Open redirect saldırılarına karşı kullanılır.
 * "//evil.com" veya "/\evil.com" gibi protocol-relative URL'leri reddeder.
 */
export const isSafeRedirect = (path: string): boolean =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.startsWith('/\\');
