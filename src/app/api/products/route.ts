import { fetchProductsSupabase } from '@/lib/api/supabaseShop';
import { ShopSearchSort } from '@/lib/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pageParam = searchParams.get('page');
    const sortParam = searchParams.get('sort') as ShopSearchSort | null;
    const options = {
      page: pageParam ? Number(pageParam) : undefined,
      sort: sortParam || undefined,
      brand: searchParams.get('brand') || undefined,
      category: searchParams.get('category') || undefined,
      query: searchParams.get('query') || undefined,
      price: searchParams.get('price') || undefined,
    };

    const result = await fetchProductsSupabase(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API /products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
