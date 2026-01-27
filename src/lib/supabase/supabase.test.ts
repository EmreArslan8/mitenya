import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSupabaseAnon } from './anon';

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  })),
}));

describe('getSupabaseAnon', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should return a Supabase client', async () => {
    // Re-import to get fresh module
    const { getSupabaseAnon: freshGetSupabaseAnon } = await import('./anon');
    const client = freshGetSupabaseAnon();
    expect(client).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it('should return same instance on multiple calls (singleton)', async () => {
    const { getSupabaseAnon: freshGetSupabaseAnon } = await import('./anon');
    const client1 = freshGetSupabaseAnon();
    const client2 = freshGetSupabaseAnon();
    expect(client1).toBe(client2);
  });

  it('should throw error when env vars are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    // Reset module to clear cached client
    vi.resetModules();

    const { getSupabaseAnon: freshGetSupabaseAnon } = await import('./anon');

    expect(() => freshGetSupabaseAnon()).toThrow('Missing Supabase environment variables');
  });
});
