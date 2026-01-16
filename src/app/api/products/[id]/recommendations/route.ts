import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
    }

    const { data } = await supabaseAdmin
      .from('products')
      .select(
        `
        id, slug, name, brand_id, brand_name,
        current_price, original_price, currency, main_image_url
      `
      )
      .eq('brand_id', brandId)
      .neq('id', productId)
      .limit(8);

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
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
