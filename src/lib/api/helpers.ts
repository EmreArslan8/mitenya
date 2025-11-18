import { CategoryData } from './types';

/* -------------------------------------------------------------------------- */
/* 🧮 YARDIMCI FONKSİYONLAR */
/* -------------------------------------------------------------------------- */

// Ana ve alt kategorileri grupla (örnek: header menüde dropdown için)
export const groupCategories = (categories: CategoryData[]) => {
  const topLevel = categories.filter((c) => !c.parent);
  const subLevel = categories.filter((c) => c.parent);
  return topLevel.map((cat) => ({
    ...cat,
    children: subLevel.filter((s) => s.parent?._ref === cat._id),
  }));
};

// Fiyat formatlama
export const formatPrice = (cents: number, currency = 'TRY'): string => {
  const amount = cents / 100;
  return currency === 'TRY'
    ? `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    : `${amount.toFixed(2)} ${currency}`;
};
