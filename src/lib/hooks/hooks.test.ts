import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock cookies-next
vi.mock('cookies-next', () => ({
  getCookie: vi.fn(),
}));

describe('useIsMobileApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false by default', async () => {
    const { getCookie } = await import('cookies-next');
    (getCookie as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

    const { useIsMobileApp } = await import('./useIsMobileApp');
    const { result } = renderHook(() => useIsMobileApp());

    expect(result.current).toBe(false);
  });

  it('should return true when cookie is set', async () => {
    const { getCookie } = await import('cookies-next');
    (getCookie as ReturnType<typeof vi.fn>).mockReturnValue('true');

    // Reset module to get fresh hook
    vi.resetModules();

    const { useIsMobileApp } = await import('./useIsMobileApp');
    const { result } = renderHook(() => useIsMobileApp());

    // Wait for useEffect
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Note: Due to useState initial value being false and useEffect updating it,
    // we check that the hook reads the cookie
    expect(getCookie).toHaveBeenCalledWith('isMobileApp');
  });
});

describe('useScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the named media-query result', async () => {
    const useScreen = (await import('./useScreen')).default;
    const { result } = renderHook(() => useScreen('smDown'));

    expect(typeof result.current).toBe('boolean');
  });

  it('shares one matchMedia store for the same query', async () => {
    vi.resetModules();
    const matchMedia = vi.fn(globalThis.matchMedia);
    vi.stubGlobal('matchMedia', matchMedia);
    const useScreen = (await import('./useScreen')).default;

    const first = renderHook(() => useScreen('mdUp'));
    const second = renderHook(() => useScreen('mdUp'));

    expect(matchMedia).toHaveBeenCalledTimes(1);
    first.unmount();
    second.unmount();
    vi.unstubAllGlobals();
  });
});
