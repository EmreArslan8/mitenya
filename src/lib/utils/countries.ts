export const countries = ['NG', 'BE', 'DE', 'GB', 'NL', 'US', 'TR', 'UZ'] as const;
export type Country = (typeof countries)[number];

export const originCountries = ['TR', 'US'] as const;
export type OriginCountry = (typeof originCountries)[number];

export const destinationCountries = ['NG', 'BE', 'DE', 'GB', 'NL', 'UZ'] as const;
export type DestinationCountry = (typeof destinationCountries)[number];

const customsLimits: {
  [key in DestinationCountry | 'EU']: { amount: number; currency: string };
} = {
  GB: { amount: 150, currency: 'EUR' },
  EU: { amount: 150, currency: 'EUR' },
  BE: { amount: 150, currency: 'EUR' },
  DE: { amount: 150, currency: 'EUR' },
  NL: { amount: 150, currency: 'EUR' },
  UZ: { amount: 1000, currency: 'USD' },
  NG: { amount: 1000, currency: 'USD' },
};

export const getCustomsLimitForCountry = (country: DestinationCountry | 'EU') =>
  customsLimits[country];

export const getCurrencyForCountry = (country?: Country | 'ww' | 'WW') => {
  switch (country) {
    case 'BE':
    case 'DE':
    case 'NL':
    case 'GB':
      return 'EUR';
    case 'TR':
      return 'TRY';
    case 'UZ':
      return 'UZS';
    case 'NG':
    case 'US':
    default:
      return 'USD';
  }
};
