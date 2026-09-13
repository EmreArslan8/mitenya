import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

/**
 * jsdom'da olmayan tarayıcı API'leri.
 * Radix primitifleri (Checkbox, Select, Dialog…) ResizeObserver ve
 * matchMedia'ya dayanıyor; merkezi useScreen hook'u da bu API'yi kullanıyor.
 */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverMock as unknown as typeof ResizeObserver;

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

// Radix bazı bileşenlerde bunu çağırıyor; jsdom'da tanımlı değil.
globalThis.HTMLElement.prototype.hasPointerCapture ??= () => false;
globalThis.HTMLElement.prototype.releasePointerCapture ??= () => {};
globalThis.HTMLElement.prototype.scrollIntoView ??= () => {};
