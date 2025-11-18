/*

import { fetchProductData } from '@/lib/api/shop';
import { OrderSummaryRequestData, ShopProductData } from '@/lib/api/types';
import { NextRequest, NextResponse } from 'next/server';
import { getOrderSummary } from '../api';

export const POST = async (req: NextRequest) => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // let { products, destination, discountCode, draftPaymentMethod, locale, region }: OrderSummaryRequestData =
  //   await req.json();
  // if (!products?.length || !locale || !region)
  //   return NextResponse.json({ error: 'Bad request.' }, { status: 400 });

  // // refetch products
  // const revalidatedProducts: (ShopProductData & { listingId: string })[] = [];
  // let error = false;
  // const promises = products.map((e) =>
  //   fetchProductData(e.id, locale, region).then((data) => {
  //     if (data)
  //       revalidatedProducts.push({
  //         ...data,
  //         id: e.src ?? e.id,
  //         listingId: e.id,
  //         quantity: e.quantity,
  //         variants: e.variants,
  //         note: (e.note ?? '') + 'shop.bringist.com' + e.url,
  //       });
  //     else error = true;
  //   })
  // );
  
  // await Promise.all(promises);

  // if (error)
  //   return NextResponse.json({ error: 'Internal server error. ID: 1001' }, { status: 500 });

  // const orderSummary = await getOrderSummary({
  //   products: revalidatedProducts,
  //   discountCode,
  //   destination,
  //   draftPaymentMethod,
  //   region,
  // });

  // if (!orderSummary)
  //   return NextResponse.json({ error: 'Internal server error. ID: 1002' }, { status: 500 });

  // if (!destination) return NextResponse.json({ orderSummary });

  // return NextResponse.json({ orderSummary });
};

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

*/