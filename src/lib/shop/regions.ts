import { Locale } from '@/i18n';

export const regions = ['uz', 'ww'] as const;
export type Region = (typeof regions)[number];

export const regionalLanguages: Record<Region, Locale[]> = {
  uz: ['uz', 'ru'],
  ww: ['en'],
};
