import { NextRequest, NextResponse } from 'next/server';
import { createClient, groq } from 'next-sanity';

// ---- SERVER (write) client: env değişkenleriyle token'lı ----
const sanityServerClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // Editor/Write token şart
});

const productQuery = groq`*[_type=="product" && _id in $ids]{
  _id,
  "slug": slug.current,
  title,
  priceCents,
  currency,
  status
}`;

// ------------------------------------------------------------
// 💡 Yardımcı Tipler
// ------------------------------------------------------------
interface ProductInput {
  id: string;
  quantity?: number;
  variantKey?: string;
}

interface FetchedProduct {
  _id: string;
  slug: string;
  title: string;
  priceCents: number;
  currency: string;
  status: string;
}

interface OrderItem {
  _type: 'object';
  productId: { _type: 'reference'; _ref: string };
  name: string;
  slug: string;
  variantKey: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Destination {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  district?: string;
  zip?: string;
  country?: string;
}

// ------------------------------------------------------------
function centsToTR(cents: number): string {
  return `₺${(cents / 100).toLocaleString('tr-TR')}`;
}

// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const {
      products,
      destination,
      paymentType,
      shipping,
      discountCode,
    }: {
      products: ProductInput[];
      destination?: Destination;
      paymentType: 'card' | 'cod';
      shipping: 'standard' | 'express';
      discountCode?: string;
    } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }

    // 1️⃣ Ürünleri Sanity’den yeniden çek
    const ids = products.map((p) => p.id);
    const fresh: FetchedProduct[] = await sanityServerClient.fetch(productQuery, { ids });

    // 1.a) Eksik ürün kontrolü
    const missing = ids.filter((id) => !fresh.some((f) => f._id === id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Bazı ürünler bulunamadı: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // 1.b) Yayında olmayan ürün kontrolü
    const unpublished = fresh.filter((f) => f.status !== 'PUBLISHED');
    if (unpublished.length > 0) {
      return NextResponse.json(
        { error: `Yayında olmayan ürün(ler): ${unpublished.map((u) => u.title).join(', ')}` },
        { status: 400 }
      );
    }

    // 2️⃣ Sipariş satırlarını oluştur
    const items: OrderItem[] = products.map((p) => {
      const f = fresh.find((x) => x._id === p.id)!;
      const quantity = Math.max(1, Math.min(99, Number(p.quantity ?? 1)));
      const unitPrice = Number(f.priceCents);
      const lineTotal = unitPrice * quantity;
      return {
        _type: 'object',
        productId: { _type: 'reference', _ref: f._id },
        name: f.title,
        slug: f.slug,
        variantKey: p.variantKey ?? null,
        unitPrice,
        quantity,
        lineTotal,
      };
    });

    // 3️⃣ Tutarları hesapla
    const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const shippingFee = shipping === 'express' ? 4990 : 0;
    const discount = discountCode === 'SALOM' ? Math.round(subtotal * 0.1) : 0;
    const tax = 0;
    const totalDue = Math.max(0, subtotal + shippingFee - discount + tax);

    // 4️⃣ Siparişi oluştur
    const now = new Date().toISOString();
    const vsn = `KZM-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0')}`;

    const orderDoc = await sanityServerClient.create({
      _type: 'order',
      vsn,
      status: paymentType === 'cod' ? 'PLACED' : 'PENDING',
      currency: 'TRY',
      items,
      subtotal,
      shippingFee,
      discount,
      tax,
      totalDue,
      destination: destination ?? null,
      payment: {
        provider: paymentType === 'cod' ? 'cod' : 'mock-card',
        sessionId: null,
        paymentRef: null,
      },
      createdAt: now,
      updatedAt: now,
    });

    // 5️⃣ Ödeme yönlendirme (mock)
    if (paymentType === 'card') {
      return NextResponse.json({
        ok: true,
        paymentLink: `/checkout/success?orderId=${orderDoc._id}&total=${encodeURIComponent(
          centsToTR(totalDue)
        )}`,
      });
    }

    if (paymentType === 'cod') {
      return NextResponse.json({
        ok: true,
        order: { id: orderDoc._id, vsn, totalDue },
      });
    }

    return NextResponse.json({ error: 'Geçersiz paymentType' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    const message =
      err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Checkout işlemi başarısız', details: message },
      { status: 500 }
    );
  }
}
