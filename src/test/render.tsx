import { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

/**
 * Testler için gerçek sağlayıcılarla render.
 *
 * Ortak test sarmalayıcısı. Tema runtime'ı kaldırıldığı için şu anda
 * yalnızca ileride eklenecek gerçek sağlayıcılar için tek giriş noktasıdır.
 */
const Providers = ({ children }: { children: ReactNode }) => <>{children}</>;

export const render = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  rtlRender(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
