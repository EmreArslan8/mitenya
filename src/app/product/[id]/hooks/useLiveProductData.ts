'use client';

import type { ShopProductData, ShopProductPrice } from '@/lib/api/types';
import { useEffect, useState } from 'react';

export type LiveProductData = {
  price: ShopProductPrice;
  quantity: number;
  stockStatus: ShopProductData['stockStatus'];
};

export type LiveProductState = LiveProductData & {
  isLoading: boolean;
  isLive: boolean;
  error: boolean;
};

export function useLiveProductData(id: string, initial: LiveProductData): LiveProductState {
  const [data, setData] = useState<LiveProductData>(initial);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setData(initial);
    setIsLoading(true);
    setIsLive(false);
    setError(false);

    fetch(`/api/products/${encodeURIComponent(id)}/live`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error('Live product data request failed');
        return r.json() as Promise<LiveProductData>;
      })
      .then((json) => {
        setData(json);
        setIsLive(true);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, initial]);

  return { ...data, isLoading, isLive, error };
}
