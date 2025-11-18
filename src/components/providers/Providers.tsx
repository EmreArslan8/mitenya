'use client';

import { SessionProvider } from 'next-auth/react';
import { SearchHistoryProvider } from '@/contexts/SearchHistoryContext';
import { SelectedProductsProvider } from '@/contexts/SelectedProductsContext';
import { UnavailableItemsProvider } from '@/contexts/UnavailableItemsContext';
import { AuthContextProvider } from '@/contexts/AuthContext';
import { ShopContextProvider } from '@/contexts/ShopContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        <ShopContextProvider>
          <SelectedProductsProvider>
            <UnavailableItemsProvider>
              <SearchHistoryProvider>
                {children}
              </SearchHistoryProvider>
            </UnavailableItemsProvider>
          </SelectedProductsProvider>
        </ShopContextProvider>
      </AuthContextProvider>
    </SessionProvider>
  );
}

