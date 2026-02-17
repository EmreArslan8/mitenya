import { describe, it, expect, vi } from 'vitest';
import { validateSameOrigin, getCsrfToken, validateCsrfToken } from './security';

// Mock NextRequest
const createMockRequest = (options: {
  method?: string;
  origin?: string | null;
  referer?: string | null;
  host?: string;
  protocol?: string;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  csrfHeader?: string | null;
  csrfCookie?: string | null;
}) => {
  const {
    method = 'POST',
    origin = null,
    referer = null,
    host = 'example.com',
    protocol = 'https:',
    forwardedHost = null,
    forwardedProto = null,
    csrfHeader = null,
    csrfCookie = null,
  } = options;

  return {
    method,
    nextUrl: {
      host,
      protocol,
    },
    headers: {
      get: vi.fn((key: string) => {
        if (key === 'origin') return origin;
        if (key === 'referer') return referer;
        if (key === 'x-forwarded-host') return forwardedHost;
        if (key === 'x-forwarded-proto') return forwardedProto;
        if (key === 'x-csrf-token') return csrfHeader;
        if (key === 'cookie') return csrfCookie ? `csrf_token=${csrfCookie}` : null;
        return null;
      }),
    },
    cookies: {
      get: vi.fn((name: string) => {
        if (name === 'csrf_token' && csrfCookie) {
          return { value: csrfCookie };
        }
        return undefined;
      }),
    },
  } as any;
};

describe('validateSameOrigin', () => {
  it('should return null for safe methods (GET)', () => {
    const req = createMockRequest({ method: 'GET' });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should return null for safe methods (HEAD)', () => {
    const req = createMockRequest({ method: 'HEAD' });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should return null for safe methods (OPTIONS)', () => {
    const req = createMockRequest({ method: 'OPTIONS' });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should return null when origin matches', () => {
    const req = createMockRequest({
      method: 'POST',
      origin: 'https://example.com',
      host: 'example.com',
      protocol: 'https:',
    });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should return 403 when origin does not match', () => {
    const req = createMockRequest({
      method: 'POST',
      origin: 'https://evil.com',
      host: 'example.com',
      protocol: 'https:',
    });
    const result = validateSameOrigin(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('should check referer when origin is missing', () => {
    const req = createMockRequest({
      method: 'POST',
      origin: null,
      referer: 'https://example.com/page',
      host: 'example.com',
      protocol: 'https:',
    });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should return 403 when referer does not match', () => {
    const req = createMockRequest({
      method: 'POST',
      origin: null,
      referer: 'https://evil.com/page',
      host: 'example.com',
      protocol: 'https:',
    });
    const result = validateSameOrigin(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('should return null when no origin or referer', () => {
    const req = createMockRequest({
      method: 'POST',
      origin: null,
      referer: null,
    });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should allow forwarded origin when behind proxy', () => {
    const req = createMockRequest({
      method: 'POST',
      origin: 'https://qa.mitenya.com',
      host: 'internal.vercel.app',
      protocol: 'https:',
      forwardedHost: 'qa.mitenya.com',
      forwardedProto: 'https',
    });
    expect(validateSameOrigin(req)).toBeNull();
  });

  it('should allow origin from CSRF_ALLOWED_ORIGINS', () => {
    const prev = process.env.CSRF_ALLOWED_ORIGINS;
    try {
      process.env.CSRF_ALLOWED_ORIGINS = 'https://qa.mitenya.com,https://mitenya.com';

      const req = createMockRequest({
        method: 'POST',
        origin: 'https://qa.mitenya.com',
        host: 'example.com',
        protocol: 'https:',
      });

      expect(validateSameOrigin(req)).toBeNull();
    } finally {
      process.env.CSRF_ALLOWED_ORIGINS = prev;
    }
  });
});

describe('getCsrfToken', () => {
  it('should generate a token and cookie string', () => {
    const result = getCsrfToken();
    expect(result.token).toBeDefined();
    expect(result.token.length).toBe(48); // 24 bytes = 48 hex chars
    expect(result.cookie).toContain('csrf_token=');
    expect(result.cookie).toContain(result.token);
    expect(result.cookie).toContain('Path=/');
    expect(result.cookie).toContain('Max-Age=1800');
    expect(result.cookie).toContain('SameSite=Lax');
  });

  it('should generate unique tokens', () => {
    const result1 = getCsrfToken();
    const result2 = getCsrfToken();
    expect(result1.token).not.toBe(result2.token);
  });
});

describe('validateCsrfToken', () => {
  it('should return null for safe methods', () => {
    const req = createMockRequest({ method: 'GET' });
    expect(validateCsrfToken(req)).toBeNull();
  });

  it('should return null when tokens match (from cookie object)', () => {
    const token = 'valid-csrf-token';
    const req = createMockRequest({
      method: 'POST',
      csrfHeader: token,
      csrfCookie: token,
    });
    expect(validateCsrfToken(req)).toBeNull();
  });

  it('should return 403 when header token is missing', () => {
    const req = createMockRequest({
      method: 'POST',
      csrfHeader: null,
      csrfCookie: 'some-token',
    });
    const result = validateCsrfToken(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('should return 403 when cookie token is missing', () => {
    const req = createMockRequest({
      method: 'POST',
      csrfHeader: 'some-token',
      csrfCookie: null,
    });
    const result = validateCsrfToken(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('should return 403 when tokens do not match', () => {
    const req = createMockRequest({
      method: 'POST',
      csrfHeader: 'token-1',
      csrfCookie: 'token-2',
    });
    const result = validateCsrfToken(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });
});
