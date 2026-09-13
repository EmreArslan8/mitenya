'use client';

import { useSyncExternalStore } from 'react';

type MediaStore = {
  getSnapshot: () => boolean;
  subscribe: (onChange: () => void) => () => void;
};

const stores = new Map<string, MediaStore>();
const subscribeOnServer = () => () => undefined;

const getStore = (query: string): MediaStore => {
  const cached = stores.get(query);
  if (cached) return cached;

  const media = window.matchMedia(query);
  const store = {
    getSnapshot: () => media.matches,
    subscribe: (onChange: () => void) => {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
  };
  stores.set(query, store);
  return store;
};

/**
 * Aynı sorguyu kullanan bileşenler tek MediaQueryList örneğini paylaşır.
 * Görsel responsive düzen CSS'te kalır; bu hook yalnızca davranış içindir.
 */
const useMediaQuery = (query: string, serverMatch = false) => {
  const store = typeof window === 'undefined' ? null : getStore(query);

  return useSyncExternalStore(
    store?.subscribe ?? subscribeOnServer,
    store?.getSnapshot ?? (() => serverMatch),
    () => serverMatch,
  );
};

export default useMediaQuery;
