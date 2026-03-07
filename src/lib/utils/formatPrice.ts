export default function formatPrice(
  value: number,
  currency: string = 'TRY',
  locale: string = 'tr-TR'
): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

    if (currency === 'TRY') {
      return formatted.replace('₺', '').trim() + ' TL';
    }

    return formatted;
  } catch (e) {
    // Fallback: TRY formatında dön
    return `${value.toFixed(2)} ${currency}`;
  }
}
