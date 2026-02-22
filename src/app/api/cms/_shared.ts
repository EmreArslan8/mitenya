import type { StrapiCollectionResult } from '@/lib/api/bring';

export const CMS_CONFIG_ERROR = {
  message: 'Internal Server Error: Missing CMS configuration',
} as const;

export const CMS_INTERNAL_ERROR = {
  message: 'Internal Server Error',
} as const;

export const getFirstAttributes = <T>(
  result: StrapiCollectionResult<T> | null
): T | undefined => result?.data?.[0]?.attributes;

