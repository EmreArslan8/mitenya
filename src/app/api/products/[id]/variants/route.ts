import { ApiErrors } from '@/lib/api/errors';
import { getSupabaseAnon } from '@/lib/supabase/anon';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Validate product ID
    const validation = ProductIdSchema.safeParse(productId);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const supabase = getSupabaseAnon();
    const { data, error } = await supabase
      .from('products')
      .select('attributes_json')
      .eq('id', validation.data)
      .single();

    if (error || !data) {
      return NextResponse.json([]);
    }

    const variants = typeof data.attributes_json === 'string'
      ? JSON.parse(data.attributes_json)
      : data.attributes_json;

    return NextResponse.json(variants || []);
  } catch (error) {
    console.error('API /products/[id]/variants error:', error);
    return ApiErrors.internalError('Failed to fetch variants');
  }
}
