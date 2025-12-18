import 'server-only';

import { bring } from '@/lib/api/bring';
import { AddressData, PaymentType, ShopOrderSummaryData, ShopProductData } from '@/lib/api/types';
import { EMPTY_EMAIL, EMPTY_TAX_NUMBER } from '@/lib/api/useAddress';
import { Region } from '@/lib/shop/regions';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { decrypt } from '../utils/crypto';

/* export const getOrderSummary = async (data: {
  virtualSuiteNumber?: string;
  discountCode?: string;
  destination?: AddressData;
  products: (ShopProductData & { listingId: string })[];
  draftPaymentMethod?: PaymentType;
  region: Region;
}): Promise<ShopOrderSummaryData | undefined> => {
  try {
    const session = await getServerSession(authOptions);
    const url = session ? '/buyformeorders/v1' : '/buyformeorders/v1/summary';

    let toCountryCode: string | undefined =
      data.destination?.countryCode ?? data.region.toUpperCase();

    if (toCountryCode === 'UZ') toCountryCode = 'UX';

    const body = {
      discountCode: data.discountCode?.toUpperCase(),
      fromCountryCode: 'TR',
      toCountryCode: toCountryCode,
      idToken: session?.idToken,
      draftPaymentMethod: data.draftPaymentMethod,
      products: data.products.map((e) => ({
        ...e,
        name: e.brand + ' ' + e.name,
        url: decrypt(e.id),
        price: { amount: e.price.currentPrice, currency: e.price.currency },
        note: e.note ?? '',
      })),
    };

    const res = await bring(url, { body });
    if (!res[0]) throw new Error('Could not get order summary');
    const { virtualSuiteNumber: vsn, ...orderSummary } = res[0];

    const productCostPreDiscount =
      data.products?.reduce((acc, e) => acc + e.price.originalPrice * e.quantity, 0) ?? 0;

    const productCost =
      data.products?.reduce((acc, e) => acc + e.price.currentPrice * e.quantity, 0) ?? 0;

    const productDiscountPercent = Math.floor(
      ((productCostPreDiscount - productCost) / productCostPreDiscount) * 100
    );

    if (data.region === 'ww' && !data.destination?.countryCode) {
      orderSummary.total -= orderSummary.shipmentCost ?? 0;
      orderSummary.totalDue -= orderSummary.shipmentCost ?? 0;
      orderSummary.shipmentCost = null;
    }

    const summary: ShopOrderSummaryData = {
      vsn,
      id: orderSummary.id,
      customsCharges: orderSummary.customsCharges,
      shipmentCost: orderSummary.shipmentCost,
      currency: orderSummary.currency,
      promotionDiscount: orderSummary.discount,
      discountCode: orderSummary.discountCode,
      productCostPreDiscount,
      productCost,
      productDiscountPercent,
      totalDiscount: (orderSummary.discount ?? 0) + (productCostPreDiscount - productCost),
      total: orderSummary.total,
      totalDue: orderSummary.totalDue,
      cashOnDeliveryAvailability: orderSummary.cashOnDeliveryAvailability,
      codServiceFee: orderSummary.codServiceFee,
    };

    return summary;
  } catch {
    return undefined;
  }
};

*/

export const initializePayment = async (
  id: string,
  contactAddress: AddressData,
  locale: Locale,
  paymentType: PaymentType
): Promise<{ paymentLink?: string; sessionId?: string } | undefined> => {
  try {
    const url = `/buyformeorders/v1/${id}/checkout`;
    const body = {
      contactAddress: {
        ...contactAddress,
        email: contactAddress.email || EMPTY_EMAIL,
        taxNumber: contactAddress.taxNumber || EMPTY_TAX_NUMBER,
      },
      returnUrls: {
        successUrl: `${process.env.NEXT_PUBLIC_HOST_URL}/success/{0}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_HOST_URL}/cart`,
      },
      paymentMethod: paymentType,
    };
    const [res] = await bring(url, { body });
    if (!res) throw new Error('Could not initialize payment.');

    // TODO: Find a better way to do this.
    let data;
    switch (paymentType) {
      case 'Stripe': {
        data = { paymentLink: res };
        break;
      }
      case 'UniversalBank': {
        data = { sessionId: res };
        break;
      }
      case 'COD': {
        data = { sessionId: res };
        break;
      }
    }
    return data;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
