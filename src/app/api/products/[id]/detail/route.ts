import { ApiErrors } from '@/lib/api/errors';
import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    console.error('API /products/[id]/detail error:', error);
    return ApiErrors.internalError('Failed to fetch product');
  }
}
