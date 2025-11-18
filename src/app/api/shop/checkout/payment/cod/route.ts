import { NextResponse } from 'next/server';

export const GET = async () => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // const searchParams = req.nextUrl.searchParams;
  // const checkoutUrl = searchParams.get('checkoutUrl');
  // const vsn = searchParams.get('vsn');
  // const pids = searchParams.get('pids');

  // if (!checkoutUrl || !vsn || !pids)
  //   return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  // const products = pids
  //   .split(',')
  //   .map((e) => {
  //     const [id, variants] = e.split(':');
  //     return `https://shop.bringist.com/product/${id}${variants ? '=> Size: ' + variants : ''}`;
  //   })
  //   .join('\n\n');

  // await bring(
  //   `https://hook.eu2.make.com/dy8utmsxira36pvula12h45mha369nar?checkoutUrl=${encodeURIComponent(
  //     checkoutUrl
  //   )}&vsn=${vsn}&pids=${products}`
  // );

  // return NextResponse.json({ message: 'Success.' }, { status: 200 });
};
