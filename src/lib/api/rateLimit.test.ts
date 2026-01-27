import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const loadRateLimit = async () => {
  vi.resetModules();
  const mod = await import('./rateLimit');
  return mod.rateLimit;
};

describe('rateLimit', () => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses memory fallback and enforces max requests', async () => {
    let now = 0;
    const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => now);
    const rateLimit = await loadRateLimit();

    const key = 'test-key';
    for (let i = 0; i < 60; i += 1) {
      expect(await rateLimit(key)).toBe(true);
    }
    expect(await rateLimit(key)).toBe(false);

    now = 60001;
    expect(await rateLimit(key)).toBe(true);

    expect(fetchMock).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it('uses Upstash when configured', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ result: [5, 'OK'] }),
    });

    const rateLimit = await loadRateLimit();
    const result = await rateLimit('key-1');

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://upstash.test/pipeline');

    const body = JSON.parse((options as RequestInit).body as string);
    expect(body[0]).toEqual(['INCR', 'key-1']);
    expect(body[1][0]).toBe('EXPIRE');
    expect(body[1][2]).toBe(60);

    const headers = (options as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token');
  });

  it('returns false when Upstash count exceeds limit', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ result: [61, 'OK'] }),
    });

    const rateLimit = await loadRateLimit();
    const result = await rateLimit('key-2');

    expect(result).toBe(false);
  });

  it('falls back to memory when Upstash errors', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });

    const rateLimit = await loadRateLimit();
    const result = await rateLimit('key-3');

    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('falls back to memory when Upstash response is unexpected', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ result: ['bad', 'OK'] }),
    });

    const rateLimit = await loadRateLimit();
    const result = await rateLimit('key-4');

    expect(result).toBe(true);
  });
});
