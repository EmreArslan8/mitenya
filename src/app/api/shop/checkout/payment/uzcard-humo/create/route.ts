
/*
import bring from '@/lib/api/bring';
import { CreateUzcardHumoPaymentData } from '@/lib/api/checkout/uzcardHumo';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const privateKey = process.env.PAYMENT_PRIVATE_KEY!;

const decrypt = (encryptedMessage: string) => {
  return JSON.parse(
    crypto.privateDecrypt(privateKey, Buffer.from(encryptedMessage, 'base64')).toString('utf8')
  );
};

export const POST = async (req: NextRequest) => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // try {
  //   const json = await req.json();
  //   let { orderId, sessionId, cardNumber, expiration, paymentMethod }: CreateUzcardHumoPaymentData =
  //     decrypt(json.data);

  //   if (!sessionId || !cardNumber || !expiration?.month || !expiration?.year)
  //     return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  //   const [res, err] = await bring(`/buyformeorders/v1/${orderId}/checkout/${sessionId}/card`, {
  //     body: {
  //       paymentMethod,
  //       cardNumber,
  //       cardExpiration: `${expiration.year.padStart(2, '0')}${expiration.month.padStart(2, '0')}`,
  //     },
  //   });
  //   if (err || !res) throw new Error(err?.message || 'Empty response (Session ID).');
  //   return NextResponse.json({ success: true, sessionId: res.sessionId });
  // } catch (error) {
  //   console.log(error);
  //   return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  // }
};

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

*/