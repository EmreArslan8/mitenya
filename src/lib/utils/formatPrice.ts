export default function formatPrice(
  value: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    // Fallback: TRY formatında dön
    return `${value.toFixed(2)} ${currency}`;
  }
}
