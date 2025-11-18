import getCurrencySymbol from './currencies';


const formatPrice = (
  price?: number,
  currency?: string,
  locale?: Locale,
  hideCurrency?: boolean
) => {
  if (price === undefined || price === null) return '--.--';
  const currencySymbol = !hideCurrency && currency ? `${getCurrencySymbol(currency, locale)} ` : '';

  if (currency === 'UZS')
    return `${price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} ${currencySymbol}`;
  else
    return `${currencySymbol}${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
};

export default formatPrice;
