

import { SharedSiblingImageType } from '@/components/cms/shared/cmsTypes';
import { DestinationCountry } from '../utils/countries';
import { Currency } from '../utils/currencies';


export interface CMSImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  ext?: string;
  [key: string]: unknown;
}


export type ExchangeRate = {
  from: string;
  to: string;
  rate: number;
};

export type CustomerDB = {
  id: string;
  provider_id: string;
  full_name: string;
  email: string;
  culture: string;
  phone: string | null;
  warehouse_id?: string | null;
  created_at: string;
};


export type CustomerData = {
  fullName: string;
  email: string;
  phone: string;
  culture?: string;
  
};

export type CreateCustomerRequestData = {
  name: string;
  surname: string;
  email: string;
  culture: string;
  phoneCode?: string;
  phoneNumber?: string;
};

export type PagedResults<T> = {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  totalRecordCount: number;
  results: T[];
};

export type AddressData = {
  id?: number;
  name: string;
  contactName: string;
  contactSurname: string;
  fatherName?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  phoneCode: string;
  phoneNumber: string;
  email?: string;
  taxNumber?: string;
  line1: string;
  line2: string;
  line3: string;
  postcode: string;
  district: string;
  city: string;
  state: string;
  countryCode: DestinationCountry;
};

export type CODFailureReason =
  | 'OutstandingShipmentsExceedsLimit'
  | 'OutstandingShipmentsAndNewBasketTotalExceedsLimit'
  | 'CustomerNotEligible'
  | 'CountryNotEligible';

export type ShopOrderSummaryData = {
  vsn: string;
  id: string;
  customsCharges?: {
    label: string;
    price: number;
  }[];
  shipmentCost: number;
  currency: Currency;
  promotionDiscount?: number;
  discountCode?: string;
  productCostPreDiscount: number;
  productCost: number;
  productDiscountPercent: number;
  totalDiscount: number;
  codServiceFee: null;
  total: number;
  totalDue: number;
  cashOnDeliveryAvailability: {
    isAvailable: boolean;
    codBalance: { amount: number; currency: string };
    failureReason: CODFailureReason | "NOT_SUPPORTED" | null;
  };
};

export type ShopOrderStatus = 'processing' | 'preparing' | 'shipped' | 'cancelled';

export type ShopOrderListItemData = {
  id: string;
  orderId: string;
  createdDate: string;
  status: ShopOrderStatus;
};

export type ShopOrderData = {
  id: string;
  orderId: string;
  totalOrderProductCount: number;
  address: AddressData;
  status: ShopOrderStatus;
  createdDate: string;
  products: ShopProductData[];
  trackingNumber?: string;
  invoiceUrl?: string;
  paymentSummary: ShopOrderSummaryData;
};

export type ShopProductRating = {
  averageRating: number;
  totalCount: number;
};

export type ShopProductPrice = {
  currentPrice: number;
  originalPrice: number;
  currency: Currency;
};

export type ShopProductListItemData = {
  id: string;
  brand: string;
  brandId: string;
  category?: string;
  name: string;
  url: string;
  images?: { url: string }[];
  imgSrc: string;
  price: ShopProductPrice;
  rating?: ShopProductRating;
  breadcrumbs?: string;
  hasVariant?: boolean;
};

export type ShopProductVariantOptionData = {
  id?: string;
  value: string;
  isAvailable: boolean;
  selected: boolean;
  price?: number;
};

export type ShopProductVariantData = {
  name: string;
  options: ShopProductVariantOptionData[];
};

export type ShopProductAttribute = {
  name: string;
  value: string;
};

export type ShopProductReview = {
  name?: string;
  rating?: number;
  text: string;
  date?: string;
};

export type ShopProductBreadcrumb = { text: string; searchOptions: ShopSearchOptions };

export type Spec = { label: string; value: string };

export type ShopProductData = {
  id: string;
  url: string;
  brand?: string;
  brandId?: string;
  category?: string;
  imgSrc?: string;
  images?: string[];
  variants?: ShopProductVariantData[];
  name?: string;
  price: ShopProductPrice;
  note?: string;
  quantity: number;
  rating?: ShopProductRating;
  description?: string;
  attributes?: ShopProductAttribute[];
  reviews?: ShopProductReview[];
  sizeRecommendation?: string;
  sizeGuide?: string;
  breadcrumbs?: ShopProductBreadcrumb[];
  src?: string;
  faqs?: {
    question: string;
    answer: string;
    sort_order?: number;
  }[];
};

export type PaymentType = 'Stripe' | 'UniversalBank' | 'COD' ;

export type OrderSummaryRequestData = {
  products: ShopProductData[];
  destination?: AddressData;
  discountCode?: string;
  draftPaymentMethod?: PaymentType;
};

export type CheckoutRequestData = {
  id: string;
  destination: AddressData;
  paymentType: PaymentType;
};

export type ShopFilterType = 'brand' | 'category' | 'gender' | 'size' | 'price' | 'color';

export type ShopGender =
  | '1' // women
  | '2' // men
  | '3' // children
  | '4' // girls
  | '5' // boys
  | '6' // baby girls
  | '7'; // baby boys

export type ShopFilter<T extends ShopFilterType> = {
  type: T;
  text: string;
  searchOptions: {
    query?: string;
    brand?: string;
    category?: string;
    gender?: ShopGender;
    size?: string;
    colors?: string;
    price?: string;
    color?: string;
  };
  selected?: boolean;
  allowMultiple?: boolean;
};

export type ShopSearchResponseFilters = {
  selectedOptions?: Partial<ShopSearchOptions>;
  categories?: ShopFilter<'category'>[];
  brands?: ShopFilter<'brand'>[];
  genders?: ShopFilter<'gender'>[];
  sizes?: ShopFilter<'size'>[];
  colors?: ShopFilter<'color'>[];
  priceRanges?: ShopFilter<'price'>[];
};

export type ShopSearchSort = 'dsc' | 'asc' | 'rcc' | 'bst' | 'fav' | 'rct';


export type ShopSearchOptions = {
  page?: number;
  query?: string;
  brand?: string;
  category?: string;
  gender?: ShopGender;
  size?: string;
  nt?: boolean; // NOTE: stands for No Translation
  nf?: boolean; // NOTE: stands for No Filters
  _S1?: string; // NOTE: refer to h-1-index
  sort?: ShopSearchSort;
  ph?: string;
  xt?: string; // string for extra terms -- this is added as is. hunters choose to deal with the value however they wish.
  collection?: string;
  color?: string;
  price?: string; // min-max
};

export type ShopSearchResponse = {
  products: ShopProductListItemData[];
  totalCount: number;
  tq?: string; // NOTE: stands for Translated Query
  filters?: ShopSearchResponseFilters;
  sortOptions?: ShopSearchSort[];
  session?: {
    _S1?: string; // NOTE: refer to h-1-index
  };
};

export type ShopHeaderLink = { label: string; slug: string | undefined | null };

export type CategorySubItem = {
  id: number;
  label: string;
  slug?: string;
};

export type CategorySub = {
  id: number;
  label: string;
  slug?: string;
  items?: CategorySubItem[];
};

export type CategoryParent = {
  id: number;
  label: string;
  slug?: string;
  subs?: CategorySub[];
  brands?: CategoryBrandItem[];
};

export type CategoryBrandItem = {
  id: number;
  label: string;
  slug?: string;
  image: SharedSiblingImageType;
}


export type ShopFooterLink = {
  label: string;
  url: string | undefined | null;
  children?: ShopFooterLink[];
};
export type SharedSocialButton = {
  platform: 'facebook' | 'x' | 'linkedin' | 'instagram' | 'telegram';
  url: string;
};
export type ShopHeaderData = { links?: ShopHeaderLink[]; bannerLinks?: ShopHeaderLink[];  categories?: CategoryParent[]; };

export type ShopFooterData = {
  links?: ShopFooterLink[];
  socials: SharedSocialButton[];
  address?: string;
  vendors?: { data: SharedSiblingImageType[] };
};

export type PhoneNumber = { phoneCode: string; phoneNumber: string };

/* --- Sanity veri tipi
export interface SanityProductData {
  _id: string;
  title: string;
  slug: { current: string };
  priceCents: number;
  currency?: string;
  brand?: string;
  category?: string;
  shortDesc?: string;
  description?: any[];
  badges?: string[];
  images?: {
    _type: 'image';
    asset: { _ref: string; _type: 'reference' };
  }[];
}


*/

// src/lib/api/types.ts

export interface ImageRef {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
}

export interface BrandData {
  _id: string;
  name?: string;
  title?: string;
  slug?: { current: string };
  logo?: ImageRef;
}

export interface CategoryData {
  _id: string;
  title: string;
  slug: { current: string };
  parent?: { _ref: string };
  image?: ImageRef;
  heroImage?: ImageRef;
  children?: CategoryData[];
}

/*
export interface ProductData {
  _id: string;
  slug: { current: string };
  title: string;
  priceCents: number;
  currency?: string;
  image?: ImageRef;
  brand?: string;
  category?: string;
  shortDesc?: string;
  description?: string | any[];
  badges?: string[];
  specs?: { label: string; value: string }[];
}

*/