import 'server-only';
import bring from './bring';
import { CMSBlock } from '@/components/cms/blocks';
import { ShopHeaderData, ShopFooterData, ShopCouponSetData } from './types';

export type CMSPageData = {
  title: string;
  blocks: CMSBlock[];
  gap: 'small' | 'medium';
};

export type CMSProductPdpData = {
  blocks: CMSBlock[];
};

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';

export const fetchShopIndex = async (
  slug?: string
): Promise<CMSPageData | undefined> => {
  try {
    const [data] = await bring<CMSPageData>('/api/cms/shop-index', {
      params: slug ? { slug } : {},
      static: true,
      next: { revalidate: isProduction ? 60 : 0 },
    });

    return data ?? undefined;
  } catch {
    return undefined;
  }
};

export const fetchShopHeader = async (): Promise<
  ShopHeaderData | undefined
> => {
  try {
    const [data] = await bring<ShopHeaderData>('/api/cms/shop-header', {
      static: true,
      next: { revalidate: 60 },
    });

    return data ?? undefined;
  } catch {
    return undefined;
  }
};

export const fetchProductPdpBlocks = async (
  slug: string
): Promise<CMSBlock[] | undefined> => {
  try {
    const [data] = await bring<CMSProductPdpData>('/api/cms/product-pdp', {
      params: { slug },
      static: true,
      next: { revalidate: isProduction ? 60 : 0 },
    });

    return data?.blocks ?? [];
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
    const [data] = await bring<ShopFooterData>('/api/cms/shop-footer', {
      static: true,
      next: { revalidate: 60 },
    });

    return data ?? undefined;
  } catch {
    return undefined;
  }
};

/* --------------------------------
 * SHOP COUPON SET
 * -------------------------------- */
export const fetchShopCouponSet = async (): Promise<
  ShopCouponSetData | undefined
> => {
  try {
    const [data] = await bring<ShopCouponSetData>('/api/cms/shop-coupon-sets', {
      static: true,
      next: { revalidate: 60 },
    });

    return data ?? undefined;
  } catch {
    return undefined;
  }
};
