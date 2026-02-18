import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { processPaytrCallback } from '@/lib/payments/paytr/callbackService';
import type { PaytrCallbackPayload } from '@/lib/payments/paytr/types';

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;

const PAYTR_IP_ALLOWLIST = (process.env.PAYTR_IP_ALLOWLIST || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

const okResponse = () =>
  new NextResponse('OK', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });

export async function POST(req: NextRequest) {
  const caller = getClientIp(req);
  if (!(await rateLimit(`paytr_callback:${caller}`))) {
    console.warn('PayTR callback rate limited', { caller });
    return okResponse();
  }

  if (PAYTR_IP_ALLOWLIST.length) {
    const clientIp = caller;
    if (!clientIp || !PAYTR_IP_ALLOWLIST.includes(clientIp)) {
      console.warn('PayTR callback forbidden IP', { clientIp });
      return okResponse();
    }
  }

  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const merchant_oid = params.get('merchant_oid') ?? '';
  const status = params.get('status') ?? '';
  const total_amount = params.get('total_amount') ?? '';
  const hash = params.get('hash') ?? '';
  const failed_reason_code = params.get('failed_reason_code') ?? '';
  const failed_reason_msg = params.get('failed_reason_msg') ?? '';
  const payment_type = params.get('payment_type') ?? '';
  const currency = params.get('currency') ?? '';

  if (!merchant_oid || !status || !total_amount || !hash) {
    console.error('PayTR callback missing required fields', {
      merchant_oid,
      status,
      total_amount,
      hasHash: !!hash,
    });
    return okResponse();
  }

  const tokenRaw = `${merchant_oid}${PAYTR_MERCHANT_SALT}${status}${total_amount}`;
  const token = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY).update(tokenRaw).digest('base64');

  if (token !== hash) {
    console.error('PayTR callback hash mismatch', { merchant_oid, status, total_amount });
    return okResponse();
  }

  const payload: PaytrCallbackPayload = {
    merchantOid: merchant_oid,
    status,
    totalAmount: total_amount,
    failedReasonCode: failed_reason_code,
    failedReasonMsg: failed_reason_msg,
    paymentType: payment_type,
    currency,
    rawPayload: Object.fromEntries(params.entries()),
  };

  try {
    await processPaytrCallback({
      payload,
      callerIp: caller,
      userAgent: req.headers.get('user-agent') || '',
    });
  } catch (error) {
    console.error('PayTR callback process error', { merchant_oid, status, error });
  }

  return okResponse();
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
