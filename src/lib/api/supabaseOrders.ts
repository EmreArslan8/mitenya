// Server-only - Bu dosya sadece Server Component'larda kullanılmalı
import { createSupabaseServer } from "../supabase/server";
import {
  PagedResults,
  ShopOrderData,
  ShopOrderListItemData,
  ShopOrderStatus,
} from "./types";

export async function fetchOrdersSupabase(): Promise<PagedResults<ShopOrderListItemData> | undefined> {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { results: [], totalRecordCount: 0, currentPage: 1, pageCount: 1, pageSize: 50 };
    }

    const { data: orders, error, count } = await supabase
      .from("orders")
      .select("id, order_number, status, created_at", { count: "exact" })
      .eq("user_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch orders error:", error);
      return undefined;
    }

    const results: ShopOrderListItemData[] = (orders || []).map((order) => ({
      id: order.id,
      orderId: order.order_number || order.id,
      createdDate: order.created_at,
      status: order.status as ShopOrderStatus,
    }));

    return {
      results,
      totalRecordCount: count || 0,
      currentPage: 1,
      pageCount: 1,
      pageSize: 50,
    };
  } catch (error) {
    console.error("Fetch orders error:", error);
    return undefined;
  }
}

export async function fetchOrderSupabase(id: string): Promise<ShopOrderData | undefined> {
  try {
    const supabase = await createSupabaseServer();

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from("orders").select("*");
    if (isUUID) {
      query = query.eq("id", id);
    } else {
      query = query.eq("order_number", id);
    }

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      console.error("Fetch order error:", orderError);
      return undefined;
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    let shippingAddress = null;
    if (order.shipping_address) {
      try {
        shippingAddress =
          typeof order.shipping_address === "string"
            ? JSON.parse(order.shipping_address)
            : order.shipping_address;
      } catch {
        shippingAddress = order.shipping_address;
      }
    }

    return {
      id: order.id,
      orderId: order.order_number || order.id,
      totalOrderProductCount: items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0,
      address: shippingAddress as ShopOrderData["address"],
      status: order.status as ShopOrderStatus,
      createdDate: order.created_at,
      products: (items || []).map((item) => ({
        id: item.product_id,
        url: "",
        name: item.product_name,
        imgSrc: item.image_url,
        price: {
          currentPrice: parseFloat(item.price),
          originalPrice: parseFloat(item.price),
          currency: item.currency || "TRY",
        },
        quantity: item.quantity || 1,
      })),
      trackingNumber: order.tracking_number,
      invoiceUrl: order.invoice_url,
      paymentSummary: {
        vsn: "",
        id: order.id,
        shipmentCost: parseFloat(order.shipping_cost || 0),
        currency: order.currency || "TRY",
        productCostPreDiscount: parseFloat(order.subtotal || order.product_cost || 0),
        productCost: parseFloat(order.product_cost || 0),
        productDiscountPercent: 0,
        totalDiscount: parseFloat(order.discount_amount || 0),
        total: parseFloat(order.total_amount || 0),
        totalDue: parseFloat(order.total_amount || 0),
        cashOnDeliveryAvailability: {
          isAvailable: false,
          codBalance: { amount: 0, currency: "TRY" },
          failureReason: null,
        },
        codServiceFee: null,
      },
    };
  } catch (error) {
    console.error("Fetch order error:", error);
    return undefined;
  }
}
