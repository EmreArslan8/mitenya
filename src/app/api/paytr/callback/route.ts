import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/api/rateLimit";
import { getClientIp } from "@/lib/api/getClientIp";

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PAYTR_IP_ALLOWLIST = (process.env.PAYTR_IP_ALLOWLIST || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

const okResponse = () =>
  new NextResponse("OK", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });

export async function POST(req: NextRequest) {
  // IP / rate limit throttling
  const caller = getClientIp(req);
  if (!(await rateLimit(`paytr_callback:${caller}`))) {
    console.warn("PayTR callback rate limited", { caller });
    return okResponse();
  }

  if (PAYTR_IP_ALLOWLIST.length) {
    const clientIp = caller;
    if (!clientIp || !PAYTR_IP_ALLOWLIST.includes(clientIp)) {
      console.warn("PayTR callback forbidden IP", { clientIp });
      return okResponse();
    }
  }

  // PayTR callback genelde form-urlencoded gönderir (örneklerde Request.Form) :contentReference[oaicite:5]{index=5}
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const merchant_oid = params.get("merchant_oid") ?? "";
  const status = params.get("status") ?? "";
  const total_amount = params.get("total_amount") ?? "";
  const hash = params.get("hash") ?? "";
  const failed_reason_code = params.get("failed_reason_code") ?? "";
  const failed_reason_msg = params.get("failed_reason_msg") ?? "";
  const payment_type = params.get("payment_type") ?? "";
  const currency = params.get("currency") ?? "";
  const payment_amount = params.get("payment_amount") ?? "";

  if (!merchant_oid || !status || !total_amount || !hash) {
    console.error("PayTR callback missing required fields", {
      merchant_oid,
      status,
      total_amount,
      hasHash: !!hash,
    });
    return okResponse();
  }

  // Hash doğrulama: merchant_oid + merchant_salt + status + total_amount, HMAC-SHA256(merchant_key), base64 :contentReference[oaicite:6]{index=6}
  const tokenRaw = `${merchant_oid}${PAYTR_MERCHANT_SALT}${status}${total_amount}`;
  const token = crypto.createHmac("sha256", PAYTR_MERCHANT_KEY).update(tokenRaw).digest("base64");

  if (token !== hash) {
    // kötü hash → işlem yapma, yine de PayTR'ye OK dön
    console.error("PayTR callback hash mismatch", { merchant_oid, status, total_amount });
    return okResponse();
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  // Önce order_number/id ile, bulunamazsa metadata.paytr_merchant_oid ile bul
  let { data: order } = await supabase
    .from("orders")
    .select("id, order_number, payment_status, status")
    .or(`order_number.eq.${merchant_oid},id.eq.${merchant_oid}`)
    .single();

  if (!order) {
    const byMeta = await supabase
      .from("orders")
      .select("id, order_number, payment_status, status")
      .eq("metadata->>paytr_merchant_oid", merchant_oid)
      .single();
    order = byMeta.data ?? null;
  }

  if (!order) {
    console.error("PayTR callback: Order bulunamadı:", merchant_oid);
    return okResponse();
  }

  // Aynı sipariş için birden fazla callback gelebilir.
  // Daha önce paid işlendiyse tekrar işlem yapmadan OK dön.
  if (order.payment_status === "paid") {
    return okResponse();
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
      description: `Ödeme başarıyla alındı. Tahsilat: ${(parseInt(total_amount, 10) / 100).toFixed(2)} ${currency || "TL"} | payment_type: ${payment_type || "-"}`,
    });
  } else {
    // Ödeme daha önce başarıya geçmişse başarısız callback ile geri çekme
    if (order.payment_status === "paid") {
      return okResponse();
    }

    // Ödeme başarısız
    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        status: "cancelled"
      })
      .eq("id", order.id);

    // Event kaydet
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "payment_failed",
      description: `Ödeme başarısız oldu. code=${failed_reason_code || "-"} msg=${failed_reason_msg || "-"} | payment_amount=${payment_amount || "-"} | total_amount=${total_amount || "-"}`,
    });
  }

  return okResponse();
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
