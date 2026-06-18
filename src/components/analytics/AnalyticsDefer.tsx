'use client';

import dynamic from 'next/dynamic';

const AttributionTracker = dynamic(() => import('./AttributionTracker'), { ssr: false });
const MetaPixelPageView = dynamic(() => import('./MetaPixelPageView'), { ssr: false });
const TikTokPixelPageView = dynamic(() => import('./TikTokPixelPageView'), { ssr: false });

export default function AnalyticsDefer() {
  return (
    <>
      <AttributionTracker />
      <MetaPixelPageView />
      <TikTokPixelPageView />
    </>
  );
}
