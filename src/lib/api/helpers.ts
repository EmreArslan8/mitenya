/**
 * `groupCategories` icin gereken minimum kategori sekli. Eskiden `./types`
 * icindeki `CategoryData` import ediliyordu; o tip artik yok (Sanity semasi
 * `CategoryParent`/`CategorySub` olarak bolundu), bu yuzden yerelde tanimli.
 */
type GroupableCategory = {
  _id: string;
  parent?: { _ref?: string } | null;
};

/* -------------------------------------------------------------------------- */
/* 🧮 YARDIMCI FONKSİYONLAR */
/* -------------------------------------------------------------------------- */

// Ana ve alt kategorileri grupla (örnek: header menüde dropdown için)
export const groupCategories = <T extends GroupableCategory>(categories: T[]) => {
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
