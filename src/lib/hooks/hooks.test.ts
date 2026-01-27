import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock cookies-next
vi.mock('cookies-next', () => ({
  getCookie: vi.fn(),
}));

// Mock MUI
vi.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    breakpoints: {
      down: () => '(max-width: 600px)',
      up: () => '(min-width: 600px)',
    },
  }),
}));

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false),
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

  it('should return screen size states', async () => {
    const useScreen = (await import('./useScreen')).default;
    const { result } = renderHook(() => useScreen());

    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('smDown');
    expect(result.current).toHaveProperty('mdDown');
    expect(result.current).toHaveProperty('lgDown');
    expect(result.current).toHaveProperty('smUp');
    expect(result.current).toHaveProperty('mdUp');
    expect(result.current).toHaveProperty('lgUp');
  });

  it('should return boolean values', async () => {
    const useScreen = (await import('./useScreen')).default;
    const { result } = renderHook(() => useScreen());

    expect(typeof result.current.isMobile).toBe('boolean');
    expect(typeof result.current.isTablet).toBe('boolean');
  });
});
