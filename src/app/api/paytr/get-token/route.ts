import { NextRequest, NextResponse } from 'next/server';
import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';

// GÜVENLİ: Client'tan sadece ürün ID'leri ve miktarları alınır
// Fiyatlar MUTLAKA veritabanından çekilir
type PaytrTokenRequestPayload = {
  merchantOid: string;
  email: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  // GÜVENLİK: Artık fiyat bilgisi client'tan alınmıyor!
  products: { id: string; quantity: number }[];
  discountCode?: string;
};

// PayTR response örneği (entegrasyona göre değişebilir)
type PaytrTokenApiResponse = {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
  err_no?: string;
};

const sLog = (...args: any[]) => {
  console.log('[PAYTR_API]', ...args);
};

export const POST = async (req: NextRequest) => {
  const traceId = req.headers.get('x-trace-id') ?? `srv_${Date.now()}`;
  sLog('INCOMING', { traceId });

  let body: PaytrTokenRequestPayload;

  try {
    body = (await req.json()) as PaytrTokenRequestPayload;
  } catch {
    sLog('INVALID_JSON', { traceId });
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  // Minimal validation - artık products array'i kontrol ediliyor
  if (
    !body?.merchantOid ||
    !body?.email ||
    !body?.userName ||
    !body?.userPhone ||
    !body?.userAddress ||
    !Array.isArray(body?.products) ||
    body.products.length === 0
  ) {
    sLog('BAD_REQUEST', { traceId, bodySummary: { ...body, products: `count:${body?.products?.length ?? 0}` } });
    return NextResponse.json({ ok: false, error: 'Bad request.' }, { status: 400 });
  }

  // GÜVENLİK: Ürün fiyatlarını veritabanından çek
  sLog('FETCHING_PRODUCTS_FROM_DB', { traceId, productCount: body.products.length });

  const verifiedBasket: { name: string; unitPrice: number; quantity: number }[] = [];
  let totalAmount = 0;

  for (const item of body.products) {
    const productData = await fetchProductDataSupabase(item.id);

    if (!productData) {
      sLog('PRODUCT_NOT_FOUND', { traceId, productId: item.id });
      return NextResponse.json(
        { ok: false, error: `Ürün bulunamadı: ${item.id}` },
        { status: 400 }
      );
    }

    const quantity = item.quantity || 1;
    const unitPrice = productData.price.currentPrice;
    const itemTotal = unitPrice * quantity;

    verifiedBasket.push({
      name: `${productData.brand} ${productData.name}`.substring(0, 50),
      unitPrice,
      quantity,
    });

    totalAmount += itemTotal;
  }

  // İndirim kodu kontrolü (opsiyonel)
  let discount = 0;
  const normalizedCode = body.discountCode?.trim().toUpperCase();
  if (normalizedCode === 'BRINGIST10') {
    discount = Math.floor(totalAmount * 0.1);
  }

  // Kargo hesaplama
  let shippingCost = 0;
  if (totalAmount < 750) {
    shippingCost = 39.9;
  }

  // Final tutar (kuruş cinsinden)
  const finalAmount = totalAmount + shippingCost - discount;
  const paymentAmountKurus = Math.round(finalAmount * 100);

  sLog('VERIFIED_AMOUNT', {
    traceId,
    totalAmount,
    discount,
    shippingCost,
    finalAmount,
    paymentAmountKurus
  });

  // Burada merchant bilgileri ENV'den okunur
  const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
  const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
  const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

  if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
    sLog('MISSING_ENV', { traceId });
    return NextResponse.json({ ok: false, error: 'Missing PayTR env vars.' }, { status: 500 });
  }

  // PayTR "user_basket" genelde base64(json) ister (entegrasyona göre)
  // Bu alan isimleri PayTR dokümanına göre düzenlenmelidir.
  // Burada "token debug + iz sürme" için tipik bir şablon bırakıyorum.

  try {
    sLog('PREPARE_REQUEST', {
      traceId,
      merchantOid: body.merchantOid,
      // GÜVENLİK: Artık sunucu tarafında hesaplanan tutar kullanılıyor
      paymentAmountKurus,
      basketCount: verifiedBasket.length,
    });

    /**
     * GÜVENLİK NOTU:
     * - Tüm fiyatlar veritabanından çekildi (verifiedBasket)
     * - Toplam tutar sunucu tarafında hesaplandı (paymentAmountKurus)
     * - Client'tan gelen fiyat bilgisi KULLANILMIYOR
     */

    // GÜVENLİ: Veritabanından çekilen fiyatlarla basket oluştur
    const userBasketJson = JSON.stringify(
      verifiedBasket.map((x) => [
        x.name,
        String(Math.round(Number(x.unitPrice) * 100)), // kuruş cinsinden
        String(x.quantity),
      ])
    );
    const userBasketBase64 = Buffer.from(userBasketJson).toString('base64');

    // ŞİMDİLİK: token üretimi yok -> demo amaçlı request şablonu.
    // Burada gerçek "paytr_token" üretimi yapılmalı.
    // Eğer istersen bir sonraki adımda PayTR dokümanındaki formüle göre HMAC/SHA256 token üretimini eklerim.
    const paytr_token = 'REPLACE_WITH_REAL_PAYTR_TOKEN_GENERATION';

    // GÜVENLİ: Sunucu tarafında hesaplanan tutar kullanılıyor
    const paytrRequestBody = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      merchant_oid: body.merchantOid,
      email: body.email,
      payment_amount: String(paymentAmountKurus), // GÜVENLİ: DB'den hesaplanan tutar
      user_name: body.userName,
      user_phone: body.userPhone,
      user_address: body.userAddress,
      user_basket: userBasketBase64, // GÜVENLİ: DB'den çekilen ürünler
      paytr_token,
      // diğer zorunlu alanlar: merchant_ok_url, merchant_fail_url, debug_on, test_mode, currency, no_installment, max_installment, lang, ip, vb.
    });

    sLog('PAYTR_FETCH_START', { traceId });

    const r = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paytrRequestBody.toString(),
    });

    const data = (await r.json()) as PaytrTokenApiResponse;

    sLog('PAYTR_FETCH_END', {
      traceId,
      httpStatus: r.status,
      status: data?.status,
      reason: data?.reason,
      err_no: data?.err_no,
      hasToken: !!data?.token,
    });

    if (!r.ok || data.status !== 'success' || !data.token) {
      return NextResponse.json(
        { ok: false, reason: data?.reason ?? 'PayTR failed', error: data?.err_no },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, token: data.token }, { status: 200 });
  } catch (e: any) {
    sLog('SERVER_ERROR', { traceId, message: e?.message, e });
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
