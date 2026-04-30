'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ToggleFavoriteResult = {
  ok: boolean;
  isFavorite?: boolean;
  unauthorized?: boolean;
  error?: string;
};

interface FavoritesContextState {
  favoriteIds: Set<string>;
  isFavoritesReady: boolean;
  isFavoritesLoading: boolean;
  isFavorite: (productId: string) => boolean;
  isFavoriteLoading: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<ToggleFavoriteResult>;
  refreshFavorites: () => Promise<void>;
}

const defaultState: FavoritesContextState = {
  favoriteIds: new Set<string>(),
  isFavoritesReady: false,
  isFavoritesLoading: false,
  isFavorite: () => false,
  isFavoriteLoading: () => false,
  toggleFavorite: async () => ({ ok: false }),
  refreshFavorites: async () => {},
};

export const FavoritesContext = createContext<FavoritesContextState>(defaultState);

export const useFavorites = () => useContext(FavoritesContext);

interface FavoritesContextProviderProps {
  children: ReactNode;
}

export const FavoritesContextProvider = ({ children }: FavoritesContextProviderProps) => {
  const { isAuthenticated, isGuest } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [isFavoritesReady, setIsFavoritesReady] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (isAuthenticated !== true || isGuest) {
      setFavoriteIds(new Set());
      setIsFavoritesReady(isAuthenticated === false || isGuest);
      return;
    }

    setIsFavoritesLoading(true);
    try {
      const res = await fetch('/api/favorites', { method: 'GET' });
      if (!res.ok) throw new Error('Favorites fetch failed');

      const payload = await res.json();
      const productIds = Array.isArray(payload?.data?.productIds) ? payload.data.productIds : [];
      setFavoriteIds(new Set(productIds.map((id: unknown) => String(id))));
    } catch (error) {
      console.error('Favorites fetch error:', error);
      setFavoriteIds(new Set());
    } finally {
      setIsFavoritesLoading(false);
      setIsFavoritesReady(true);
    }
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    setIsFavoritesReady(false);
    void refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const isFavoriteLoading = useCallback(
    (productId: string) => loadingIds.has(productId),
    [loadingIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string): Promise<ToggleFavoriteResult> => {
      if (isAuthenticated !== true || isGuest) {
        return { ok: false, unauthorized: true };
      }
      if (!productId || loadingIds.has(productId)) {
        return { ok: false };
      }

      const currentlyFavorite = favoriteIds.has(productId);

      setLoadingIds((prev) => new Set(prev).add(productId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFavorite) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        const res = await fetch(
          currentlyFavorite
            ? `/api/favorites/${encodeURIComponent(productId)}`
            : '/api/favorites',
          currentlyFavorite
            ? { method: 'DELETE' }
            : {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
              }
        );

        if (!res.ok) {
          if (res.status === 401) throw new Error('UNAUTHORIZED');
          throw new Error('FAVORITE_MUTATION_FAILED');
        }

        return { ok: true, isFavorite: !currentlyFavorite };
      } catch (error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (currentlyFavorite) next.add(productId);
          else next.delete(productId);
          return next;
        });

        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
          return { ok: false, unauthorized: true };
        }
        return { ok: false, error: 'Favori işlemi başarısız oldu' };
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [favoriteIds, isAuthenticated, isGuest, loadingIds]
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavoritesReady,
      isFavoritesLoading,
      isFavorite,
      isFavoriteLoading,
      toggleFavorite,
      refreshFavorites,
    }),
    [
      favoriteIds,
      isFavoritesReady,
      isFavoritesLoading,
      isFavorite,
      isFavoriteLoading,
      toggleFavorite,
      refreshFavorites,
    ]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
