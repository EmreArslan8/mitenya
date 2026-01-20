import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ensureCsrfToken, getCsrfTokenFromCookie, withCsrfHeaders } from './csrf';

const clearCookies = () => {
  document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .forEach((cookie) => {
      const name = cookie.split('=')[0];
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
};

describe('csrf utils', () => {
  beforeEach(() => {
    clearCookies();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearCookies();
  });

  it('creates a token and stores it in cookie', () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
    });

    const token = ensureCsrfToken();
    expect(token).toBe('123e4567e89b12d3a456426614174000');
    expect(getCsrfTokenFromCookie()).toBe(token);
  });

  it('reuses existing cookie token', () => {
    document.cookie = 'csrf_token=existing; path=/';
    const randomUUID = vi.fn(() => 'new-token');
    vi.stubGlobal('crypto', { randomUUID });

    const token = ensureCsrfToken();
    expect(token).toBe('existing');
    expect(randomUUID).not.toHaveBeenCalled();
  });

  it('returns empty string when window is undefined', () => {
    vi.stubGlobal('window', undefined as any);

    const token = ensureCsrfToken();
    expect(token).toBe('');
  });

  it('reads csrf token from cookie', () => {
    document.cookie = 'a=1; path=/';
    document.cookie = 'csrf_token=abc; path=/';
    document.cookie = 'b=2; path=/';

    expect(getCsrfTokenFromCookie()).toBe('abc');
  });

  it('adds csrf header and preserves existing headers', () => {
    document.cookie = 'csrf_token=header-token; path=/';

    const result = withCsrfHeaders({ headers: { 'x-test': '1' } });
    expect(result.headers).toEqual({
      'x-test': '1',
      'x-csrf-token': 'header-token',
    });
  });
});
