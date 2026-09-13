import bring from '../bring';
import { CheckoutRequestData, OrderSummaryRequestData, ShopOrderSummaryData } from '../types';

export const getOrderSummary = async (
  data: OrderSummaryRequestData
): Promise<{ orderSummary: ShopOrderSummaryData } | undefined> => {
  const url = '/api/shop/checkout/order-summary';
  const [res] = await bring<{ orderSummary: ShopOrderSummaryData }>(url, { body: data });
  return res ?? undefined;
};

export const checkout = async (
  data: CheckoutRequestData
): Promise<{ paymentLink?: string; sessionId?: string } | undefined> => {
  try {
    const url = '/api/shop/checkout/payment';
    const [res, err] = await bring<{ paymentLink?: string; sessionId?: string }>(url, {
      body: data,
    });
    if (err) throw new Error(err.message);
    return res ?? undefined;
  } catch (error) {
    console.log(error);
  }
};
