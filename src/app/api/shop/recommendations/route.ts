/*

import { Locale } from '@/i18n';
import { Region } from '@/lib/shop/regions';
import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from './engines';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const brandId = searchParams.get('brandId');
  const locale = searchParams.get('locale') as Locale;
  const region = searchParams.get('region') as Region;
  if (!productId || !brandId || !locale || !region)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  try {
    const results = await recommendationEngine({ brandId, productId, locale, region });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json([]);
  }
};

*/
