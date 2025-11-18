import { useAuth } from '@/contexts/AuthContext';
import { CustomerData, ShopOrderSummaryData, ShopProductData } from '../api/types';

interface CommonEventParams {
  page_type?: string;
  cd_language?: string;
  cd_country?: string;
  cd_page_url?: string;
  cd_page_path?: string;
}

const getCommonEventParams = (): CommonEventParams => ({
  page_type: document.title,
  cd_language:
    window.location.pathname.split('/')[1].length === 2
      ? window.location.pathname.split('/')[1]
      : 'en',
  cd_page_url: window.location.href,
  cd_page_path: window.location.pathname,
});

export type DataLayerEvent = Record<string, unknown>;

const isDataLayerValid = (value: unknown): value is DataLayerEvent[] => {
  return Array.isArray(value);
};
export const pushItemToDataLayer = (item: DataLayerEvent) => {
  try {
    if (typeof window === "undefined") return;

    if (isDataLayerValid(window.dataLayer)) {
      window.dataLayer.push(item);
    }
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
  customerData: CustomerData | undefined,
  product: ShopProductData
) => {
  sendEvent({
    event: 'add_to_cart',
    ecommerce: {
      customer_email: customerData?.email,
      customer_phone_number: `${customerData?.phoneCode ?? ''}${customerData?.phoneNumber ?? ''}`,
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
        customer_email: data.customerData?.email,
        customer_phone_number: `${data.customerData?.phoneCode ?? ''}${data.customerData?.phoneNumber ?? ''}`,
        items,
      },
    };
  
    // ek alanlar — mutate yerine shallow merge
    const ecommerceExt: DataLayerEvent = {};
  
    if (data.type === 'add_shipping_info' || data.type === 'purchase') {
      ecommerceExt.currency = data.orderSummary?.currency;
      ecommerceExt.value = data.orderSummary?.totalDue;
    }
  
    if (data.type === 'add_payment_info') {
      ecommerceExt.currency = data.orderSummary?.currency;
      ecommerceExt.paymentType = data.paymentType;
    }
  
    if (data.type === 'purchase') {
      ecommerceExt.transactionId = data.transactionId;
    }
  
    sendEvent({
      ...baseEvent,
      ecommerce: { 
        ...(baseEvent.ecommerce as object),
        ...ecommerceExt
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
