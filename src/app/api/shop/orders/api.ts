import 'server-only';

import bring from '@/lib/api/bring';
import {
  PagedResults,
  ShopOrderData,
  ShopOrderListItemData,
  ShopOrderStatus,
} from '@/lib/api/types';
import { encrypt } from '../utils/crypto';
import { BFMOrderData, BFMOrderListItemData, BFMOrderStatus } from '../utils/bfmTypes';

export const fetchOrders = async (
  options: { currentPage?: number; pageSize?: number } = { currentPage: 1, pageSize: 9999 }
): Promise<PagedResults<ShopOrderListItemData> | undefined> => {
  try {
    const url = '/customers/v1/me/buyformeorders';
    const res = await bring(url, { params: options });
    const data = res[0] as PagedResults<BFMOrderListItemData>;
    if (!data) throw new Error('Error fetching orders');
    const result: PagedResults<ShopOrderListItemData> = {
      ...data,
      results: data.results.map((e) => ({
        ...e,
        id: e.orderId,
        orderId: e.virtualSuiteNumber.replace('BFM', ''),
        status: transformStatus(e.status),
      })),
    };
    return result;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const fetchOrder = async (id: string): Promise<ShopOrderData | undefined> => {
  const url = `/buyformeorders/v1/${id}`;
  try {
    const res = await bring(url);
    if (!res[0]) throw new Error(`Error fetching order: ${id}`);

    const {
      virtualSuiteNumber,
      totalPackageProductCount,
      chargeableTotalWeight,
      shipmentId,
      contactName,
      contactPhone,
      ...rest
    } = res[0] as BFMOrderData;

    const fixedProducts = rest.products.map((p) => ({
      ...p,
      id: encrypt(p.url!),
      url: `/product/${encrypt(p.url!)}`,
      price: {
        currentPrice: (p as any).unitPrice.amount,
        originalPrice: (p as any).unitPrice.amount,
        currency: (p as any).unitPrice.currency,
      },
      variants: p.variants?.map((v: any) => ({
        name: v.name,
        options: [
          {
            value: v.option,
            isAvailable: true,
            selected: true,
            price: (p as any).unitPrice.amount,
          },
        ],
      })),
      breadcrumbs: undefined,
    }));

    const fixedResponse: ShopOrderData = {
      ...rest,
      orderId: virtualSuiteNumber.replace('BFM', ''),
      status: transformStatus(rest.status),
      products: fixedProducts,
      paymentSummary: {
        ...rest.paymentSummary,
        productCost: fixedProducts.reduce((acc, e) => acc + e.price.currentPrice * e.quantity, 0),
      },
      trackingNumber: await getTrackingNumber(shipmentId),
      address: {
        ...rest.address,
        contactName,
        phoneNumber: contactPhone,
      },
    };
    return fixedResponse;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

const getTrackingNumber = async (shipmentId: string | null | undefined) => {
  if (!shipmentId || shipmentId === '00000000-0000-0000-0000-000000000000') return undefined;
  try {
    const url = `/shipments/v1/${shipmentId}`;
    const res = await bring(url);
    return res[0]?.trackingNumber;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

const transformStatus = (status: BFMOrderStatus): ShopOrderStatus => {
  switch (status) {
    case 'waiting':
      return 'processing';
    case 'approved':
    case 'purchase-completed':
    case 'packages-arrived':
      return 'preparing';
    case 'shipped':
      return 'shipped';
    case 'rejected':
      return 'cancelled';
  }
};
