import { bring } from './bring';
import {
  AddressData,
  PagedResults,
  ShopOrderData,
  ShopOrderListItemData,
  ShopProductData,
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponse
} from './types';

export const fetchProducts = async (
  options: Partial<ShopSearchOptions>
): Promise<ShopSearchResponse | undefined> => {
  try {
    const url = '/api/shop/search';
    const res = await bring(url, { params: options });
    return res[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const fetchRecommendations = async (options: {
  brandId: string;
  productId: string;
}): Promise<ShopProductListItemData[]> => {
  try {
    const url = '/api/shop/recommendations';
    const res = await bring(url, { params: options });
    return res[0];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const fetchProductData = async (
  id: string,
): Promise<ShopProductData | undefined> => {
  const url = '/api/shop/product';
  const res = await bring(url, { params: { id  }, next: { revalidate: 60 } });
  return res[0];
};


export const fetchOrders = async (): Promise<PagedResults<ShopOrderListItemData> | undefined> => {
  const url = '/api/shop/orders';
  const res = await bring(url);
  return res[0];
};

export const fetchOrder = async (id: string): Promise<ShopOrderData | undefined> => {
  const url = `/api/shop/orders/${id}`;
  const res = await bring(url);
  return res[0];
};

export const finalizeCodOrder = async (
  checkoutUrl: string,
  vsn: string,
  selected: ShopProductData[]
): Promise<boolean> => {
  try {
    const pids = selected
      .map(
        (e) =>
          `${e.id}${
            e.variants?.length
              ? ' : ' + e.variants.map((v) => v.options.find((o) => o.selected)?.value).join('-')
              : ''
          }`
      )
      .join(',');

    const params = { checkoutUrl, vsn, pids };
    const [, err] = await bring('/api/shop/checkout/cod', { params });
    if (err) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
