import { ApiErrors } from '@/lib/api/errors';
import { fetchProductsSupabase } from '@/lib/api/supabaseShop';
import { ProductsQuerySchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';
import { compressedJson } from '@/lib/api/compressedJson';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const userIp = getClientIp(request);
    if (!(await rateLimit(`products_list:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const rawParams = {
      page: searchParams.get('page') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      collection: searchParams.get('collection') ?? undefined,
      query: searchParams.get('query') ?? undefined,
      price: searchParams.get('price') ?? undefined,
    };

    const validation = ProductsQuerySchema.safeParse(rawParams);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const result = await fetchProductsSupabase(validation.data);
    return compressedJson(request, result);
  } catch (error) {
    console.error('API /products error:', error);
    return ApiErrors.internalError('Failed to fetch products');
  }
}
