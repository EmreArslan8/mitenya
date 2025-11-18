import { NextResponse } from 'next/server';

export const POST = async () => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // let {
  //   id,
  //   destination,
  //   locale = 'en',
  //   paymentType = 'Stripe',
  // }: CheckoutRequestData = await req.json();
  // if (!id || !destination) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });

  // const res = await initializePayment(id, destination, locale, paymentType);
  // if (!res) return NextResponse.json({ error: 'Internal server error. ID: 1003' }, { status: 500 });

  // return NextResponse.json(res);
};

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
