'use client';

import { fetchProductData } from '@/lib/api/shop';
import { ShopProductData } from '@/lib/api/types';
import useAnalytics from '@/lib/hooks/useAnalytics';
import clamp from '@/lib/utils/clamp';
import { Currency } from '@/lib/utils/currencies';
import { sendAddToCardEvent } from '@/lib/utils/googleAnalytics';
import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

interface ShopContextState {
  isCartReady: boolean;
  cart?: ShopProductData[];
  numItems: number;
  totalPrice: { amount?: number; currency?: Currency };
  handleAddItem: (product: ShopProductData) => boolean;
  handleDeleteProduct: (product: ShopProductData) => void;
  handleDecreaseItemQuantity: (product: ShopProductData) => void;
  handleIncreaseItemQuantity: (product: ShopProductData) => boolean;
  getItemQuantity: (product: ShopProductData) => number;
  clearCart: () => void;
  removeItems: (items: ShopProductData[]) => void;
  newProductAdded: ShopProductData | undefined;
  selected?: ShopProductData[] | undefined | null;
  toggleSelected: (product: ShopProductData) => void;
  toggleSelectedAll: () => void;
  numSelected: number;
  isSelected: (product: ShopProductData) => boolean;
  isSelectedAll: boolean;
  totalSelectedPreDiscount: number;
  totalSelectedDue: number;
  unavailableItems: ShopProductData[];
  handleDismissUnavailableItem: (product: ShopProductData) => void;
  searchHistory: string[];
  addSearchQuery: (query: string) => void;
  removeSearchQuery: (query: string) => void;
  clearAllHistory: () => void;
  loadSearchHistory: () => void;
}

export const ShopContext = createContext<ShopContextState>({} as ShopContextState);

export const isEqProduct = (a: ShopProductData, b: ShopProductData) =>
  a.id === b.id && JSON.stringify(a.variants) === JSON.stringify(b.variants);

interface ShopContextProviderProps {
  children: ReactNode;
}

export const ShopContextProvider = ({ children }: ShopContextProviderProps) => {
  const { customerData } = useAuth();
  const { sendAction } = useAnalytics();

  const [cart, setCart] = useState<ShopProductData[]>();
  const [isCartReady, setIsCartReady] = useState(false);
  const [newProductAdded, setNewProductAdded] = useState<ShopProductData>();
  const [selected, setSelected] = useState<ShopProductData[] | undefined | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<ShopProductData[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // ------------------------------
  // SEARCH HISTORY
  // ------------------------------
  const getSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  };

  const addSearchQuery = (query: string) => {
    const history = getSearchHistory();
    if (!history.includes(query)) {
      history.push(query);
      localStorage.setItem('searchHistory', JSON.stringify(history));
    }
    setSearchHistory(history);
  };

  const removeSearchQuery = (query: string) => {
    let history = getSearchHistory();
    history = history.filter((item: string) => item !== query);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    setSearchHistory(history);
  };

  const clearAllHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const loadSearchHistory = () => {
    const fullHistory = getSearchHistory();
    const limitedHistory = fullHistory.slice(-10);
    setSearchHistory(limitedHistory);
  };

  useEffect(() => loadSearchHistory(), []);

  // ------------------------------
  // PRODUCT SELECTION
  // ------------------------------
  const isSelected = (product: ShopProductData) =>
    selected?.some((e) => isEqProduct(e, product)) ?? false;

  const toggleSelected = (product: ShopProductData) =>
    isSelected(product)
      ? setSelected((prev) => prev?.filter((e) => !isEqProduct(e, product)))
      : setSelected((prev) => [...(prev ?? []), product]);

  const toggleSelectedAll = () =>
    cart?.every((e) => isSelected(e)) ? setSelected([]) : setSelected(cart);

  const numSelected = useMemo(
    () => selected?.reduce((acc, e) => acc + e.quantity, 0) ?? 0,
    [selected]
  );

  const isSelectedAll = useMemo(() => selected?.length === cart?.length, [selected, cart]);

  const numItems = useMemo(
    () => cart?.reduce((acc, e) => acc + e.quantity, 0) ?? 0,
    [cart]
  );

  const totalPrice = useMemo(
    () => ({
      amount: cart?.reduce((acc, e) => acc + e.price.currentPrice * e.quantity, 0) ?? 0,
      currency: cart?.[0]?.price.currency,
    }),
    [cart]
  );

  const totalSelectedPreDiscount = useMemo(
    () => selected?.reduce((acc, e) => acc + e.price.originalPrice * e.quantity, 0) ?? 0,
    [selected]
  );

  const totalSelectedDue = useMemo(
    () => selected?.reduce((acc, e) => acc + e.price.currentPrice * e.quantity, 0) ?? 0,
    [selected]
  );

  const getItemQuantity = (product: ShopProductData) =>
    cart?.find((e) => isEqProduct(e, product))?.quantity ?? 0;

  // ------------------------------
  // CART OPERATIONS
  // ------------------------------
  const handleDeleteProduct = (product: ShopProductData) => {
    if (!cart) return;
    setCart((prev) => prev!.filter((p) => !isEqProduct(p, product)));
  };

  const handleDecreaseItemQuantity = (product: ShopProductData) => {
    if (!cart) return;
    const currentQuantity = getItemQuantity(product);
    if (currentQuantity === 1) return handleDeleteProduct(product);

    setCart((prev) =>
      prev!.map((p) =>
        isEqProduct(p, product) ? { ...p, quantity: clamp(1, p.quantity - 1, 5) } : p
      )
    );
  };

  const handleIncreaseItemQuantity = (product: ShopProductData) => {
    if (!cart) return false;
    if (getItemQuantity(product) > 4) return false;

    setCart((prev) =>
      prev!.map((p) =>
        isEqProduct(p, product) ? { ...p, quantity: clamp(1, p.quantity + 1, 5) } : p
      )
    );
    return true;
  };

  const handleAddItem = (product: ShopProductData) => {
    if (!cart) return false;

    if (cart.some((p) => isEqProduct(p, product))) {
      return handleIncreaseItemQuantity(product);
    }

    setCart((prev) => [...prev!, { ...product, quantity: 1 }]);
    setNewProductAdded({ ...product, quantity: 1 });

    // Analytics
    sendAddToCardEvent(customerData, product);
    sendAction({
      event: 'add_to_cart',
      details: {
        product: `${product.name} ${product.id}`,
        url: product.url,
      },
    });

    return true;
  };

  // UNAVAILABLE ITEMS
  const handleDismissUnavailableItem = (product: ShopProductData) => {
    const newUnavailable = unavailableItems.filter((e) => !isEqProduct(e, product));
    setUnavailableItems(newUnavailable);
    localStorage.setItem('unavailableItems', JSON.stringify(newUnavailable));
  };

  const removeItems = (items: ShopProductData[]) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

      const updatedCart = currentCart.filter(
        (cartItem: ShopProductData) =>
          !items.some((purchased: ShopProductData) => isEqProduct(purchased, cartItem))
      );

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing items:', error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // ------------------------------
  // LOCAL STORAGE
  // ------------------------------
  const saveToLocalStorage = () => {
    if (cart) localStorage.setItem('cart', JSON.stringify(cart));
    if (unavailableItems)
      localStorage.setItem('unavailableItems', JSON.stringify(unavailableItems));
  };

  const getFromLocalStorage = (includeUnavailable = false) => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') ?? '[]');
      if (!includeUnavailable) return cartData;

      const unavailableData = JSON.parse(localStorage.getItem('unavailableItems') ?? '[]');
      return [...cartData, ...unavailableData];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const loadFromLocalStorage = () => {
    const data = getFromLocalStorage();
    if (!data) return;
    setCart(data);
  };

  // ------------------------------
  // CART REINITIALIZATION
  // ------------------------------
  const reinitalizeCart = async (cartItems?: ShopProductData[]) => {
    try {
      if (!cartItems) return;

      let newCart: ShopProductData[] = [];
      let newUnavailable: ShopProductData[] = [];

      const deduped = Array.from(new Set(cartItems.map((e) => JSON.stringify(e)))).map((e) =>
        JSON.parse(e)
      );

      const promises = deduped.map((e) =>
        fetchProductData(e.id).then((data) => {
          try {
            if (!data) {
              newUnavailable.push(e);
              return;
            }

            newCart.push({ ...data, quantity: e.quantity, variants: e.variants });
          } catch (error) {
            console.log(error);
          }
        })
      );

      await Promise.all(promises);

      setCart(newCart);
      setUnavailableItems(newUnavailable);
      localStorage.setItem('cart', JSON.stringify(newCart));
      localStorage.setItem('unavailableItems', JSON.stringify(newUnavailable));
    } catch (error) {
      console.log('Reinit cart error:', error);
    } finally {
      setIsCartReady(true);
    }
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) =>
      e.key === 'cart' && loadFromLocalStorage();

    window.addEventListener('storage', handleStorage);

    const data = getFromLocalStorage(true);
    reinitalizeCart(data);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (isCartReady) saveToLocalStorage();
  }, [isCartReady, cart, unavailableItems]);

  useEffect(() => {
    if (!cart) return;

    if (selected) {
      setSelected((prev) =>
        prev
          ?.filter((e) => cart.some((c) => isEqProduct(e, c)))
          .map((e) => ({
            ...e,
            quantity: cart.find((c) => isEqProduct(e, c))!.quantity,
          }))
      );
      return;
    }

    setSelected(cart);
  }, [cart]);

  useEffect(() => {
    if (!newProductAdded) return;

    setSelected((prev) =>
      prev?.some((e) => isEqProduct(newProductAdded, e))
        ? prev
        : [...(prev ?? []), newProductAdded]
    );
  }, [newProductAdded]);

  // ------------------------------
  // PROVIDER VALUE
  // ------------------------------
  const value = useMemo(
    () => ({
      isCartReady,
      cart,
      numItems,
      totalPrice,
      handleAddItem,
      handleDeleteProduct,
      handleDecreaseItemQuantity,
      handleIncreaseItemQuantity,
      getItemQuantity,
      clearCart,
      newProductAdded,
      selected,
      toggleSelected,
      toggleSelectedAll,
      numSelected,
      isSelected,
      isSelectedAll,
      totalSelectedPreDiscount,
      totalSelectedDue,
      unavailableItems,
      handleDismissUnavailableItem,
      removeItems,
      searchHistory,
      addSearchQuery,
      removeSearchQuery,
      clearAllHistory,
      loadSearchHistory,
    }),
    [
      isCartReady,
      cart,
      numItems,
      totalPrice,
      selected,
      unavailableItems,
      searchHistory,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
