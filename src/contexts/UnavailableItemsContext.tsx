'use client';
import { createContext, useState } from 'react';
import { ShopProductData } from '@/lib/api/types';

interface UnavailableItemsContextType {
  unavailable: ShopProductData[];
  markUnavailable: (product: ShopProductData) => void;
  dismissUnavailable: (product: ShopProductData) => void;
}

export const UnavailableItemsContext = createContext<UnavailableItemsContextType>({} as UnavailableItemsContextType);

export function UnavailableItemsProvider({ children }: { children: React.ReactNode }) {
  const [unavailable, setUnavailable] = useState<ShopProductData[]>([]);

  const markUnavailable = (product: ShopProductData) =>
    setUnavailable(prev => [...prev, product]);

  const dismissUnavailable = (product: ShopProductData) =>
    setUnavailable(prev => prev.filter(p => p.id !== product.id));

  return (
    <UnavailableItemsContext.Provider value={{ unavailable, markUnavailable, dismissUnavailable }}>
      {children}
    </UnavailableItemsContext.Provider>
  );
}
