'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface DeferredClientBlockProps {
  children: ReactNode;
  /** Bilesen viewport'a bu kadar yaklasinca hazirlanmaya baslar. */
  rootMargin?: string;
  /** Layout shift'i azaltan, sadece aktivasyon oncesi kullanilan alan. */
  minHeight?: number | string;
  /** Ana thread hic bosalmazsa en gec bu sure sonunda aktivasyona izin verilir. */
  idleTimeout?: number;
}

/**
 * Kritik olmayan ana sayfa adaciklari icin iki asamali aktivasyon:
 * 1. IntersectionObserver ile kullaniciya yaklasmasi,
 * 2. requestIdleCallback ile kritik render/hydration islerinin bitmesi.
 *
 * Kullanici bolgeyle etkilesirse iki kosul da atlanir. Aktivasyon monotondur;
 * bir kez mount edilen carousel scroll sirasinda tekrar unmount edilmez.
 */
const DeferredClientBlock = ({
  children,
  rootMargin = '500px 0px',
  minHeight,
  idleTimeout = 1400,
}: DeferredClientBlockProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [browserIdle, setBrowserIdle] = useState(false);
  const [forced, setForced] = useState(false);
  const active = forced || (nearViewport && browserIdle);

  const activateNow = useCallback(() => setForced(true), []);

  useEffect(() => {
    if (active) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [active, rootMargin]);

  useEffect(() => {
    if (active) return;

    const idleWindow = window as Window & {
      requestIdleCallback?: Window['requestIdleCallback'];
      cancelIdleCallback?: Window['cancelIdleCallback'];
    };
    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(() => setBrowserIdle(true), {
        timeout: idleTimeout,
      });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = setTimeout(() => setBrowserIdle(true), Math.min(idleTimeout, 600));
    return () => clearTimeout(timeoutId);
  }, [active, idleTimeout]);

  return (
    <div
      ref={rootRef}
      data-deferred-block
      data-deferred-state={active ? 'active' : 'waiting'}
      aria-busy={!active}
      onPointerDownCapture={activateNow}
      onPointerEnter={activateNow}
      onFocusCapture={activateNow}
      style={!active && minHeight ? { minHeight } : undefined}
    >
      {active ? children : null}
    </div>
  );
};

export default DeferredClientBlock;
