'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { onMetaPixelReady, trackViewContent } from '@/lib/analytics/metaPixel';
import { sendCapiFromClient, generateCapiEventId } from '@/lib/analytics/sendCapiFromClient';
import { trackTikTokWithUser, trackTikTokViewContent } from '@/lib/analytics/tiktokPixel';
import { ShopProductData } from '@/lib/api/types';

// Effect-only client island: PDP ViewContent (Meta Pixel + CAPI + TikTok) takibi.
// Görsel çıktı yok (null render) → DOM'a hydrate edilecek bir şey katmaz, sadece
// view.tsx server kalabilsin diye analytics effect'lerini buraya taşır.

const ProductAnalytics = ({ data }: { data: ShopProductData }) => {
  const { customerData } = useAuth();
  const tikTokUserRef = useRef<{ email?: string; phone?: string }>();

  useEffect(() => {
    tikTokUserRef.current = {
      email: customerData?.email,
      phone: customerData?.phone,
    };
  }, [customerData?.email, customerData?.phone]);

  useEffect(() => {
    const viewContentEventId = generateCapiEventId('vc');
    const cleanupMeta = onMetaPixelReady(() => {
      trackViewContent({
        content_ids: [String(data.id)],
        content_name: data.name,
        content_category: data.category,
        value: data.price.currentPrice,
        currency: data.price.currency ?? 'TRY',
        eventID: viewContentEventId,
      });
    });
    sendCapiFromClient({
      eventName: 'ViewContent',
      eventId: viewContentEventId,
      contentIds: [String(data.id)],
      contentName: data.name,
      contentCategory: data.category,
      value: data.price.currentPrice,
      currency: data.price.currency ?? 'TRY',
    });
    const cleanupTikTok = trackTikTokWithUser({
      userData: tikTokUserRef.current,
      track: () => trackTikTokViewContent({
        content_ids: [String(data.id)],
        content_name: data.name,
        content_category: data.category,
        value: data.price.currentPrice,
        currency: data.price.currency ?? 'TRY',
      }),
    });

    return () => {
      cleanupMeta();
      cleanupTikTok();
    };
  }, [data.category, data.id, data.name, data.price.currency, data.price.currentPrice]);

  return null;
};

export default ProductAnalytics;
