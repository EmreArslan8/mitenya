'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

type DeferUntilVisibleProps = {
  children: ReactNode;
  /** Kullanıcı bu mesafeye yaklaşınca içerik mount edilir. */
  rootMargin?: string;
  /** Mount öncesi yer tutucu yüksekliği (layout shift'i azaltmak için). */
  minHeight?: number | string;
};

/**
 * Below-the-fold ağır client bileşenlerini ilk hydration penceresinden çıkarır:
 * içerik yalnızca viewport'a yaklaşınca (IntersectionObserver) render edilir.
 * Böylece embla/reviews/assistant JS'i LCP render-delay anında main thread'i meşgul etmez.
 */
const DeferUntilVisible = ({
  children,
  rootMargin = '600px',
  minHeight,
}: DeferUntilVisibleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    // IntersectionObserver yoksa (çok eski tarayıcı) güvenli tarafta kal: hemen göster.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={!visible && minHeight ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
};

export default DeferUntilVisible;
