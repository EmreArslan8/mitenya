import {
  AddressData,
  ShopOrderSummaryData,
  ShopProductAttribute,
  ShopProductRating,
  ShopProductReview,
} from '@/lib/api/types';
import { Currency } from '@/lib/utils/currencies';

export type BFMOrderStatus =
  | 'waiting'
  | 'approved'
  | 'purchase-completed'
  | 'packages-arrived'
  | 'shipped'
  | 'rejected';

export type BFMOrderCancelReason = 'outOfStock' | 'priceMismatch';

export type BFMOrderListItemData = {
  orderId: string;
  virtualSuiteNumber: string;
  createdDate: string;
  status: BFMOrderStatus;
  cancelReason?: BFMOrderCancelReason;
};

export type BFMOrderData = {
  id: string;
  virtualSuiteNumber: string;
  totalOrderProductCount: number;
  totalPackageProductCount: number;
  contactName: string;
  contactPhone: string;
  address: AddressData;
  status: BFMOrderStatus;
  createdDate: string;
  products: (BFMProductData & { id: number })[];
  chargeableTotalWeight: number;
  shipmentId?: string | null;
  paymentSummary: ShopOrderSummaryData;
};

export type BFMProductVariantOptionData = {
  id?: string;
  value: string;
  isAvailable: boolean;
  selected: boolean;
};

export type BFMProductVariantData = {
  name: string;
  option?: string;
  options?: BFMProductVariantOptionData[];
};

export type BFMUnitPrice = {
  amount: number;
  currency: Currency;
};

export type BFMProductData = {
  url?: string;
  website?: string;
  brand?: string;
  imgSrc?: string;
  images?: string[];
  variants?: BFMProductVariantData[];
  name?: string;
  price?: number;
  originalPrice?: number;
  currency?: Currency;
  note?: string;
  quantity: number;
  estimatedChargeableWeight?: number;
  gtip?: string;
  rating?: ShopProductRating;
  description?: string;
  attributes?: ShopProductAttribute[];
  sizeRecommendation?: string;
  sizeGuide?: string;
  breadcrumbs?: string;
  src?: string;
  reviews?: ShopProductReview[];
  unitPrice?: BFMUnitPrice;
};
