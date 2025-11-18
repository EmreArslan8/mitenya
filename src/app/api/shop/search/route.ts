/*

import { Locale } from '@/i18n';
import { ShopSearchOptions } from '@/lib/api/types';
import { Region } from '@/lib/shop/regions';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import hunter from './hunters';

export const maxDuration = 60;

export const GET = async (req: NextRequest) => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // let {
  //   page = '1',
  //   query = '',
  //   brand = '',
  //   category = '',
  //   nt = false,
  //   ...rest
  // } = Object.fromEntries(req.nextUrl.searchParams.entries());

  // const locale = (cookies().get('NEXT_LOCALE')?.value ?? 'en') as Locale;
  // const region = (cookies().get('NEXT_REGION')?.value ?? 'uz') as Region;

  // if (
  //   typeof page !== 'string' ||
  //   typeof parseInt(page) !== 'number' ||
  //   typeof query !== 'string' ||
  //   typeof brand !== 'string' ||
  //   typeof category !== 'string' ||
  //   typeof locale !== 'string'
  // ) {
  //   return NextResponse.json({ message: 'Bad request.' }, { status: 400 });
  // }

  // const params: ShopSearchOptions = {
  //   page: parseInt(page),
  //   query,
  //   brand,
  //   category,
  //   locale,
  //   region,
  //   nt: Boolean(nt),
  //   ...rest,
  // };

  // try {
  //   const response = await hunter(params);
  //   if (!response) throw new Error('Internal Server Error');
  //   return NextResponse.json(response, { status: 200 });
  // } catch (error) {
  //   console.log(error);
  //   return NextResponse.json(error, { status: 500 });
  // }
};

export const dynamic = 'force-dynamic';

*/