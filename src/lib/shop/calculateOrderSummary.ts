import { ShopOrderSummaryData, ShopProductData } from "@/lib/api/types";

export interface CalculateOrderSummaryInput {
  products: (ShopProductData & { listingId: string; quantity: number })[];
  discountCode?: string | null;
}

export function calculateOrderSummary(
  input: CalculateOrderSummaryInput
): ShopOrderSummaryData {

  const { products, discountCode } = input;

  // 1) Ürün toplamı (indirimli)
  const productCost =
    products.reduce((sum, p) => sum + p.price.currentPrice * p.quantity, 0) ?? 0;

  // 2) Ürün toplamı (indirimsiz)
  const productCostPreDiscount =
    products.reduce(
      (sum, p) => sum + p.price.originalPrice * p.quantity,
      0
    ) ?? 0;

  const productDiscountAmount = productCostPreDiscount - productCost;
  const productDiscountPercent = productCostPreDiscount
    ? Math.floor((productDiscountAmount / productCostPreDiscount) * 100)
    : 0;

  // 3) Kupon mantığı (örnek)
  let couponDiscount = 0;
  const normalizedCode = discountCode?.trim().toUpperCase();

  if (normalizedCode === "BRINGIST10") {
    couponDiscount = Math.floor(productCost * 0.1);
  }

  // 4) Kargo Hesaplama
  let shipmentCost = 0;
  if (productCost < 500) shipmentCost = 39.9;

  // 5) Toplamlar
  const total = productCost + shipmentCost - couponDiscount;
  const totalDue = total;

  return {
    vsn: "",
    id: "local-summary",
    customsCharges: [],
    shipmentCost,
    currency: products[0]?.price.currency ?? "TRY",
    promotionDiscount: couponDiscount,
    discountCode: normalizedCode ?? "",

    productCostPreDiscount,
    productCost,
    productDiscountPercent,
    totalDiscount: couponDiscount + productDiscountAmount,
    total,
    totalDue,
    cashOnDeliveryAvailability: {
      isAvailable: false,
      codBalance: { amount: 0, currency: "TRY" },
      failureReason: "NOT_SUPPORTED"
    },
    codServiceFee: null,
  };
}
