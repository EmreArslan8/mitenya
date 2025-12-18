import 'server-only';
import bring from './bring';
import { CMSBlock } from '@/components/cms/blocks';
import { ShopHeaderData, ShopFooterData } from './types';

export type CMSPageData = {
  title: string;
  blocks: CMSBlock[];
  gap: 'small' | 'medium';
};

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';

/* --------------------------------
 * SHOP INDEX
 * -------------------------------- */
export const fetchShopIndex = async (
  slug?: string
): Promise<CMSPageData | undefined> => {
  try {
    const [data] = await bring('/api/cms/shop-index', {
      params: slug ? { slug } : {},
      static: true,
      next: { revalidate: isProduction ? 60 : 0 },
    });

    return data;
  } catch {
    return undefined;
  }
};

/* --------------------------------
 * SHOP HEADER
 * -------------------------------- */
export const fetchShopHeader = async (): Promise<
  ShopHeaderData | undefined
> => {
  try {
    const [data] = await bring('/api/cms/shop-header', {
      static: true,
      next: { revalidate: 60 },
    });

    return data;
  } catch {
    return undefined;
  }
};

/* --------------------------------
 * SHOP FOOTER
 * -------------------------------- */
export const fetchShopFooter = async (): Promise<
  ShopFooterData | undefined
> => {
  try {
    const [data] = await bring('/api/cms/shop-footer', {
      static: true,
      next: { revalidate: 60 },
    });

    return data;
  } catch {
    return undefined;
  }
};
