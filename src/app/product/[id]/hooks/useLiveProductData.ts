'use client';

import type { ShopProductData, ShopProductPrice } from '@/lib/api/types';
import { useEffect, useState } from 'react';

export type LiveProductData = {
  price: ShopProductPrice;
  quantity: number;
  stockStatus: ShopProductData['stockStatus'];
};

export function useLiveProductData(id: string, initial: LiveProductData): LiveProductData {
  const [data, setData] = useState<LiveProductData>(initial);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/products/${id}/live`, { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<LiveProductData>) : null))
      .then((json) => { if (json) setData(json); })
      .catch(() => {});

    return () => controller.abort();
  }, [id]);

  return data;
}
