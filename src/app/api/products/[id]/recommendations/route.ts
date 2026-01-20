import { ApiErrors } from '@/lib/api/errors';
import { getSupabaseAnon } from '@/lib/supabase/anon';
import { ProductIdSchema, BrandIdSchema } from '@/lib/validations/products';
import { RECOMMENDATIONS_LIMIT } from '@/lib/constants/shop';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    // Validate inputs
    const productValidation = ProductIdSchema.safeParse(productId);
    if (!productValidation.success) {
      return ApiErrors.validationError(productValidation.error.issues);
    }

    const brandValidation = BrandIdSchema.safeParse(brandId);
    if (!brandValidation.success) {
      return ApiErrors.badRequest('brandId is required and must be valid');
    }

    const supabase = getSupabaseAnon();
    const { data } = await supabase
      .from('products')
      .select(
        `
        id, slug, name, brand_id, brand_name,
        current_price, original_price, currency, main_image_url
      `
      )
      .eq('brand_id', brandValidation.data)
      .neq('id', productValidation.data)
      .limit(RECOMMENDATIONS_LIMIT);

    const recommendations = (data || []).map((p) => ({
      id: p.id,
      brand: p.brand_name || '',
      brandId: p.brand_id || '',
      name: p.name,
      url: `/product/${p.slug || p.id}`,
      imgSrc: p.main_image_url || '',
      price: {
        currentPrice: Number(p.current_price) || 0,
        originalPrice: Number(p.original_price) || Number(p.current_price) || 0,
        currency: p.currency || 'TRY',
      },
    }));

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('API /products/[id]/recommendations error:', error);
    return ApiErrors.internalError('Failed to fetch recommendations');
  }
}
