'use client';
import { ShopProductData } from '@/lib/api/types';
import { createContext, useState, useMemo } from 'react';

interface SelectedProductsContextType {
  selected: ShopProductData[];
  toggleSelected: (product: ShopProductData) => void;
  toggleAll: (all: ShopProductData[]) => void;
  isSelected: (product: ShopProductData) => boolean;
  numSelected: number;
}

export const SelectedProductsContext = createContext<SelectedProductsContextType>({} as SelectedProductsContextType);

export function SelectedProductsProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<ShopProductData[]>([]);

  const toggleSelected = (product: ShopProductData) => {
    setSelected(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const toggleAll = (all: ShopProductData[]) => {
    setSelected(prev => (prev.length === all.length ? [] : all));
  };

  const isSelected = (product: ShopProductData) => selected.some(p => p.id === product.id);
  const numSelected = useMemo(() => selected.length, [selected]);

  return (
    <SelectedProductsContext.Provider value={{ selected, toggleSelected, toggleAll, isSelected, numSelected }}>
      {children}
    </SelectedProductsContext.Provider>
  );
}
