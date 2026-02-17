

export const currencyCodes = ['USD', 'EUR', 'TRY'] as const;
export type Currency = (typeof currencyCodes)[number];


const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
};

const getCurrencySymbol = (currencyCode: string) => {
  const code = currencyCode.toUpperCase();
  return currencySymbols[code as Currency] || currencyCode;
};

export const getDisplayCurrencyCode = (currencyCode: string) => {
  const code = currencyCode.toUpperCase();
  if (code === 'TRY') return 'TL';
  return code;
};

export default getCurrencySymbol;
