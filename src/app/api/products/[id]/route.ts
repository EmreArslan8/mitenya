import { ApiErrors } from '@/lib/api/errors';
import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

const DEBUG_STOCK =
  process.env.DEBUG_STOCK === 'true' || process.env.NEXT_PUBLIC_DEBUG_STOCK === 'true';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const start = Date.now();
    // Rate limiting
    const userIp = getClientIp(request);
    const rateStart = Date.now();
    const rateOk = await rateLimit(`product_detail:${userIp}`);
    console.log(`[TIMING] /api/products/[id] rateLimit ${Date.now() - rateStart}ms`);
    if (!rateOk) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const paramsStart = Date.now();
    const { id } = await params;
    console.log(`[TIMING] /api/products/[id] params ${Date.now() - paramsStart}ms`);

    // Validate product ID
    const validateStart = Date.now();
    const validation = ProductIdSchema.safeParse(id);
    console.log(`[TIMING] /api/products/[id] validate ${Date.now() - validateStart}ms`);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const fetchStart = Date.now();
    const result = await fetchProductDataSupabase(validation.data);
    console.log(`[TIMING] /api/products/[id] fetchProductDataSupabase ${Date.now() - fetchStart}ms`);

    if (!result) {
      return ApiErrors.notFound('Product');
    }

    if (DEBUG_STOCK) {
      console.log('[STOCK][API] /api/products/[id] response summary', {
        id: result.id,
        name: result.name,
        quantity: result.quantity,
      });
    }

    console.log(`[TIMING] /api/products/[id] total ${Date.now() - start}ms`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API /products/[id] error:', error);
    return ApiErrors.internalError('Failed to fetch product');
  }
}
