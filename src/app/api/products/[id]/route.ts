import { ApiErrors } from '@/lib/api/errors';
import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const userIp = getClientIp(request);
    const rateOk = await rateLimit(`product_detail:${userIp}`);
    if (!rateOk) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;

    // Validate product ID
    const validation = ProductIdSchema.safeParse(id);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const result = await fetchProductDataSupabase(validation.data);

    if (!result) {
      return ApiErrors.notFound('Product');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /products/[id] error:', error);
    return ApiErrors.internalError('Failed to fetch product');
  }
}
