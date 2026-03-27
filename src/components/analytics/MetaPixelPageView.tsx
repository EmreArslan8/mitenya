'use client';

import { trackPageView } from '@/lib/analytics/metaPixel';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent?.marketing) {
      trackPageView();
    }
  }, [pathname, consent?.marketing]);

  return null;
}
