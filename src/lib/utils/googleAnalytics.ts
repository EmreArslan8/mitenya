import { useAuth } from '@/contexts/AuthContext';
import { CustomerData, ShopOrderSummaryData, ShopProductData } from '../api/types';
import { buildAttributionFromDocument } from '../analytics/attribution';

interface CommonEventParams {
  page_type?: string;
  cd_language?: string;
  cd_country?: string;
  cd_page_url?: string;
  cd_page_path?: string;
  affiliate_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_path?: string;
}

const getCommonEventParams = (): CommonEventParams => {
  const attribution = buildAttributionFromDocument(document.cookie);

  return {
    page_type: document.title,
    cd_language:
      window.location.pathname.split('/')[1].length === 2
        ? window.location.pathname.split('/')[1]
        : 'en',
    cd_page_url: window.location.href,
    cd_page_path: window.location.pathname,
    affiliate_code: attribution?.affiliateCode ?? undefined,
    utm_source: attribution?.utmSource ?? undefined,
    utm_medium: attribution?.utmMedium ?? undefined,
    utm_campaign: attribution?.utmCampaign ?? undefined,
    utm_content: attribution?.utmContent ?? undefined,
    utm_term: attribution?.utmTerm ?? undefined,
    landing_path: attribution?.landingPath ?? undefined,
  };
};

export type DataLayerEvent = Record<string, unknown>;

export const pushItemToDataLayer = (item: DataLayerEvent) => {
  try {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(item);
  } catch (error) {
    console.error(error);
  }
};
const sendEvent = (params: DataLayerEvent) => {
  pushItemToDataLayer({ ...getCommonEventParams(), ...params });
};

export const sendMenuClickEvent = (select_menu: string) => {
  sendEvent({ event: 'menu_click', select_menu });
};

export const sendSocialMediaEvent = (select_social_media: string) => {
  sendEvent({ event: 'social_media_event', select_social_media });
};

export const sendTextCopyEvent = (copiedText: string) => {
  sendEvent({ event: 'text_copied', copiedText });
};

export const sendButtonClickEvent = (button_id: string) => {
  sendEvent({ event: 'button_click_event', button_id });
};

export const sendAddToCardEvent = (
  _customerData: CustomerData | undefined,
  product: ShopProductData
) => {
  sendEvent({
    event: 'add_to_cart',
    ecommerce: {
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          price: product.price.currentPrice,
          currency: product.price.currency,
          item_url: product.url,
          quantity: 1,
        },
      ],
    },
  });
};

export type CheckoutFunnelEventType =
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase';

export const sendCheckoutFunnelEvent = (data: {
  type: CheckoutFunnelEventType;
  customerData: CustomerData | undefined;
  products: ShopProductData[];
  orderSummary?: ShopOrderSummaryData;
  transactionId?: string;
  paymentType?: string;
}) => {
  const items = data.products.map((e) => ({
    item_id: e.id,
    item_name: e.name,
    item_brand: e.brand,
    price: e.price.currentPrice,
    currency: e.price.currency,
    item_url: e.url,
    quantity: e.quantity,
  }));

  const baseEvent: DataLayerEvent = {
    event: data.type,
    ecommerce: {
      items,
    },
  };

  const ecommerceExt: DataLayerEvent = {};

  if (data.type === 'add_shipping_info' || data.type === 'purchase') {
    ecommerceExt.currency = data.orderSummary?.currency;
    ecommerceExt.value = data.orderSummary?.totalDue;
  }

  if (data.type === 'add_payment_info') {
    ecommerceExt.currency = data.orderSummary?.currency;
    ecommerceExt.payment_type = data.paymentType;
  }

  if (data.type === 'purchase') {
    ecommerceExt.transaction_id = data.transactionId;
  }

  sendEvent({
    ...baseEvent,
    ecommerce: {
      ...(baseEvent.ecommerce as object),
      ...ecommerceExt,
    },
  });
};


export const useCheckoutAnalytics = () => {
  const { customerData } = useAuth();

  const sendBeginCheckout = (products: ShopProductData[]) =>
    sendCheckoutFunnelEvent({ type: 'begin_checkout', customerData, products });

  const sendAddShippingInfo = (products: ShopProductData[], orderSummary: ShopOrderSummaryData) =>
    sendCheckoutFunnelEvent({ type: 'add_shipping_info', customerData, products, orderSummary });

  const sendAddPaymentInfo = (
    products: ShopProductData[],
    orderSummary: ShopOrderSummaryData,
    paymentType: string
  ) =>
    sendCheckoutFunnelEvent({
      type: 'add_payment_info',
      customerData,
      products,
      orderSummary,
      paymentType,
    });

  const sendPurchase = (
    products: ShopProductData[],
    orderSummary: ShopOrderSummaryData,
    transactionId: string,
    paymentType: string
  ) =>
    sendCheckoutFunnelEvent({
      type: 'purchase',
      customerData,
      products,
      orderSummary,
      transactionId,
      paymentType,
    });

  return { sendBeginCheckout, sendAddShippingInfo, sendAddPaymentInfo, sendPurchase };
};

export const sendPurchaseEventForOrder = (order: {
  orderNumber: string;
  totalAmount: number;
  currency: string;
  paymentMethod?: string | null;
  items: Array<{
    product_id?: string | null;
    product_name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  sendEvent({
    event: 'purchase',
    ecommerce: {
      transaction_id: order.orderNumber,
      value: order.totalAmount,
      currency: order.currency,
      payment_type: order.paymentMethod ?? undefined,
      items: order.items.map((item) => ({
        item_id: item.product_id ?? item.product_name,
        item_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });
};
