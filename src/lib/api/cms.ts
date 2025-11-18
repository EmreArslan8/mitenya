import "server-only";

import { CMSBlock } from "@/components/cms/blocks";
import { ShopHeaderData } from "./types";
import { ShopFooterData } from "./types";
import { bring } from "./bring";

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === "production";

export type CMSPageData = {
  title: string;
  blocks: CMSBlock[];
  gap: "small" | "medium";
};

export const fetchShopIndex = async (
  slug: string | undefined
): Promise<CMSPageData | undefined> => {
  try {
    const url = "/api/cms/shop-index";

    const params: any = {};
    if (slug) params.slug = slug;

    // BRING CALL
    const [data, err] = await bring(url, { params });

    if (err) {
      return undefined;
    }

    return data as CMSPageData;
  } catch (error) {
    return undefined;
  }
};

export const fetchShopHeader = async (): Promise<
  ShopHeaderData | undefined
> => {
  try {
    const url = "/api/cms/shop-header";
    const results = await bring(url, {
      params: {},
    });
    return results[0] as ShopHeaderData;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const fetchShopFooter = async (): Promise<
  ShopFooterData | undefined
> => {
  try {
    const url = "/api/cms/shop-footer";
    const results = await bring(url, {
      params: {},
    });
    return results[0] as ShopFooterData;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
