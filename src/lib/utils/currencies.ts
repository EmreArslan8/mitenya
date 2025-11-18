import { Locale } from '@/i18n';

export const currencyCodes = ['USD', 'EUR', 'GBP', 'CAD', 'TRY', 'UZS'] as const;
export type Currency = (typeof currencyCodes)[number];

const globalCurrencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  TRY: '₺',
  UZS: 'UZS',
};
const uzCurrencySymbols: Record<Currency, string> = { ...globalCurrencySymbols, UZS: "so'm" };
const ruCurrencySymbols: Record<Currency, string> = { ...globalCurrencySymbols, UZS: 'сум' };
const trCurrencySymbols: Record<Currency, string> = { ...globalCurrencySymbols, UZS: 'som' };

const currencySymbols: Record<Locale, Record<Currency, string>> = {
  en: globalCurrencySymbols,
  he: globalCurrencySymbols,
  tr: trCurrencySymbols,
  uz: uzCurrencySymbols,
  ru: ruCurrencySymbols,
};

const getCurrencySymbol = (currencyCode: string, locale: Locale = 'en') => {
  const code = currencyCode.toUpperCase();
  return currencySymbols[locale][code as Currency] || currencyCode;
};

export default getCurrencySymbol;
