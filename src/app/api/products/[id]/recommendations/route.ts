import { ApiErrors } from '@/lib/api/errors';
import { getSupabaseAnon } from '@/lib/supabase/anon';
import { ProductIdSchema, BrandIdSchema } from '@/lib/validations/products';
import { RECOMMENDATIONS_LIMIT } from '@/lib/constants/shop';
import { r2Url } from '@/lib/utils/r2';
import { NextRequest, NextResponse } from 'next/server';

const selectFields = `
  id, slug, name, brand_id, brand_name, category_id,
  current_price, original_price, currency, main_image_url,
  product_stock(quantity)
`;

const readStockQuantity = (stockRows: unknown): number => {
  if (!Array.isArray(stockRows) || stockRows.length === 0) return 0;
  const firstRow = stockRows[0] as { quantity?: unknown } | null;
  return Number(firstRow?.quantity ?? 0);
};

const mapProduct = (p: any) => ({
  id: p.id,
  brand: p.brand_name || '',
  brandId: p.brand_id || '',
  name: p.name,
  url: `/product/${p.slug || p.id}`,
  imgSrc: r2Url(p.main_image_url || ''),
  price: {
    currentPrice: Number(p.current_price) || 0,
    originalPrice: Number(p.original_price) || Number(p.current_price) || 0,
    currency: p.currency || 'TRY',
  },
  quantity: readStockQuantity(p.product_stock),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const categoryId = searchParams.get('categoryId');

    const productValidation = ProductIdSchema.safeParse(productId);
    if (!productValidation.success) {
      return ApiErrors.validationError(productValidation.error.issues);
    }

    const brandValidation = BrandIdSchema.safeParse(brandId);
    if (!brandValidation.success) {
      return ApiErrors.badRequest('brandId is required and must be valid');
    }

    const supabase = getSupabaseAnon();
    const recommendations: any[] = [];
    const seenIds = new Set<string>();

    // 1. Aynı marka + aynı kategori (en alakalı)
    if (categoryId) {
      const { data: sameBrandCategory } = await supabase
        .from('products')
        .select(selectFields)
        .eq('brand_id', brandValidation.data)
        .eq('category_id', categoryId)
        .neq('id', productId)
        .limit(RECOMMENDATIONS_LIMIT);

      for (const p of sameBrandCategory || []) {
        if (!seenIds.has(p.id) && recommendations.length < RECOMMENDATIONS_LIMIT) {
          seenIds.add(p.id);
          recommendations.push(mapProduct(p));
        }
      }
    }

    // 2. Aynı kategori, farklı marka (tamamlayıcı)
    if (categoryId && recommendations.length < RECOMMENDATIONS_LIMIT) {
      const { data: sameCategoryOtherBrand } = await supabase
        .from('products')
        .select(selectFields)
        .eq('category_id', categoryId)
        .neq('id', productId)
        .limit(RECOMMENDATIONS_LIMIT);

      for (const p of sameCategoryOtherBrand || []) {
        if (!seenIds.has(p.id) && recommendations.length < RECOMMENDATIONS_LIMIT) {
          seenIds.add(p.id);
          recommendations.push(mapProduct(p));
        }
      }
    }

    // 3. Aynı marka, farklı kategori (cross-sell)
    if (recommendations.length < RECOMMENDATIONS_LIMIT) {
      const { data: sameBrandOtherCategory } = await supabase
        .from('products')
        .select(selectFields)
        .eq('brand_id', brandValidation.data)
        .neq('id', productId)
        .limit(RECOMMENDATIONS_LIMIT);

      for (const p of sameBrandOtherCategory || []) {
        if (!seenIds.has(p.id) && recommendations.length < RECOMMENDATIONS_LIMIT) {
          seenIds.add(p.id);
          recommendations.push(mapProduct(p));
        }
      }
    }

    // 4. Fallback: Herhangi bir ürün
    if (recommendations.length < RECOMMENDATIONS_LIMIT) {
      const { data: anyProducts } = await supabase
        .from('products')
        .select(selectFields)
        .neq('id', productId)
        .limit(RECOMMENDATIONS_LIMIT);

      for (const p of anyProducts || []) {
        if (!seenIds.has(p.id) && recommendations.length < RECOMMENDATIONS_LIMIT) {
          seenIds.add(p.id);
          recommendations.push(mapProduct(p));
        }
      }
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('API /products/[id]/recommendations error:', error);
    return ApiErrors.internalError('Failed to fetch recommendations');
  }
}
