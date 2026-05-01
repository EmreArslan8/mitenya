import { ApiErrors } from '@/lib/api/errors';
import { getClientIp } from '@/lib/api/getClientIp';
import { rateLimit } from '@/lib/api/rateLimit';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

type LiveProductResponse = {
  price: { currentPrice: number; originalPrice: number; currency: string };
  quantity: number;
  stockStatus: StockStatus | undefined;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const ok = await rateLimit(`product_live:${ip}`, { windowMs: 60_000, max: 120 });
    if (!ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { id } = await params;
    const validation = ProductIdSchema.safeParse(id);
    if (!validation.success) return ApiErrors.validationError(validation.error.issues);

    const slug = validation.data;

    const SELECT = `
      current_price,
      original_price,
      currency,
      product_prices(price_current, price_original, currency),
      product_stock(quantity, stock_status)
    `;

    let { data, error } = await supabaseAdmin
      .from('products')
      .select(SELECT)
      .eq('slug', slug)
      .maybeSingle();

    // Geriye dönük uyumluluk: slug eşleşmezse ID ile dene
    if (!data && !error) {
      const fallback = await supabaseAdmin
        .from('products')
        .select(SELECT)
        .eq('id', slug)
        .maybeSingle();
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !data) return ApiErrors.notFound('Product');

    const priceRow = (data.product_prices as { price_current?: unknown; price_original?: unknown; currency?: unknown }[] | null)?.[0];
    const stockRow = (data.product_stock as { quantity?: unknown; stock_status?: unknown }[] | null)?.[0];

    const currentPrice = Number(priceRow?.price_current ?? data.current_price) || 0;
    const originalPrice = Number(priceRow?.price_original ?? data.original_price) || currentPrice;
    const currency = String(priceRow?.currency ?? data.currency ?? 'TRY');
    const quantity = Number(stockRow?.quantity ?? 0);
    const stockStatus = (stockRow?.stock_status as StockStatus | undefined) ?? undefined;

    const payload: LiveProductResponse = {
      price: { currentPrice, originalPrice, currency },
      quantity,
      stockStatus,
    };

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[/api/products/[id]/live]', err);
    return ApiErrors.internalError('Failed to fetch live product data');
  }
}
