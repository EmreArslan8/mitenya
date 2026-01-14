import { ShopSearchOptions } from '@/lib/api/types';
import { NextRequest, NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/api/shop'; // <-- projendeki doğru path'e göre düzelt

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  const sp = req.nextUrl.searchParams;

  const pageStr = sp.get('page') ?? '1';
  const query = sp.get('query') ?? '';
  const brand = sp.get('brand') ?? '';
  const category = sp.get('category') ?? '';
  const ntRaw = sp.get('nt') ?? 'false';

  // string->number parse (sağlam)
  const page = Number.parseInt(pageStr, 10);
  if (!Number.isFinite(page) || page < 1) {
    return NextResponse.json({ message: 'Bad request: invalid page' }, { status: 400 });
  }

  // nt parse (string'den boolean'a)
  const nt = ntRaw === 'true' || ntRaw === '1';

  // geri kalan parametreleri de al (query params -> object)
  const rest = Object.fromEntries(
    Array.from(sp.entries()).filter(
      ([k]) => !['page', 'query', 'brand', 'category', 'nt'].includes(k)
    )
  );

  const params: ShopSearchOptions = {
    page,
    query,
    brand,
    category,
    nt,
    ...rest,
  };

  try {
    const response = await fetchProducts(params);

    if (!response) {
      return NextResponse.json({ message: 'Products not found' }, { status: 404 });
    }

    // fetchProducts zaten beklenen formatı dönüyorsa direkt dön
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};
