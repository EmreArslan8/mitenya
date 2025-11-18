/*

import { ConfirmUzcardHumoPaymentData } from '@/lib/api/checkout/uzcardHumo';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // let { orderId, sessionId, confirmationCode }: ConfirmUzcardHumoPaymentData = await req.json();
  // if (!sessionId || !confirmationCode)
  //   return NextResponse.json({ error: 'Bad request.' }, { status: 400 });

  // try {
  //   const [, err] = await bring(`/buyformeorders/v1/${orderId}/checkout/${sessionId}/card/otp`, {
  //     body: confirmationCode,
  //   });
  //   if (err) throw new Error(err.message);
  //   return NextResponse.json({ success: true });
  // } catch (error) {
  //   console.log(error);
  //   return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  // }
};

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

*/