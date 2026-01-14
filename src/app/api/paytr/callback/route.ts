import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  // PayTR callback genelde form-urlencoded gönderir (örneklerde Request.Form) :contentReference[oaicite:5]{index=5}
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const merchant_oid = params.get("merchant_oid") ?? "";
  const status = params.get("status") ?? "";
  const total_amount = params.get("total_amount") ?? "";
  const hash = params.get("hash") ?? "";

  if (!merchant_oid || !status || !total_amount || !hash) {
    return new NextResponse("OK"); // PayTR tekrar deneyebilir; burada loglamak isteyebilirsin.
  }

  // Hash doğrulama: merchant_oid + merchant_salt + status + total_amount, HMAC-SHA256(merchant_key), base64 :contentReference[oaicite:6]{index=6}
  const tokenRaw = `${merchant_oid}${PAYTR_MERCHANT_SALT}${status}${total_amount}`;
  const token = crypto.createHmac("sha256", PAYTR_MERCHANT_KEY).update(tokenRaw).digest("base64");

  if (token !== hash) {
    // kötü hash → işlem yapma
    return new NextResponse("PAYTR notification failed: bad hash", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // merchant_oid formatı: order_number veya order_id olabilir
  // Önce order'ı bul
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number")
    .or(`order_number.eq.${merchant_oid},id.eq.${merchant_oid}`)
    .single();

  if (!order) {
    console.error("PayTR callback: Order bulunamadı:", merchant_oid);
    return new NextResponse("OK");
  }

  if (status === "success") {
    // Ödeme başarılı
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        payment_id: merchant_oid
      })
      .eq("id", order.id);

    // Event kaydet
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "payment_completed",
      description: `Ödeme başarıyla alındı. Tutar: ${(parseInt(total_amount) / 100).toFixed(2)} TL`,
    });
  } else {
    // Ödeme başarısız
    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        status: "canceled"
      })
      .eq("id", order.id);

    // Event kaydet
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "payment_failed",
      description: "Ödeme başarısız oldu. Sipariş iptal edildi.",
    });
  }

  return new NextResponse("OK");
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
