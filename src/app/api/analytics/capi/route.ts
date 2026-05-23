import { NextRequest, NextResponse } from 'next/server';
import { parseCookieHeader } from '@/lib/analytics/attribution';
import { sendCapiAddToCart, sendCapiViewContent, sendCapiInitiateCheckout } from '@/lib/analytics/metaCapi';
import { rateLimit } from '@/lib/api/rateLimit';
import { validateSameOrigin } from '@/lib/api/security';
import { z } from 'zod';

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';

const schema = z.object({
  eventName: z.enum(['ViewContent', 'AddToCart', 'InitiateCheckout']),
  eventId: z.string().min(1).max(128),
  eventSourceUrl: z.string().url().optional(),
  contentIds: z.array(z.string()).min(1).max(50),
  contentName: z.string().max(500).optional(),
  contentCategory: z.string().max(200).optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  numItems: z.number().int().positive().optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  if (!isProduction) return NextResponse.json({ ok: true }); // dev/staging'de sessizce yut

  const originError = validateSameOrigin(req);
  if (originError) return originError;

  const cookies = parseCookieHeader(req.headers.get('cookie'));
  if (cookies['traffic_type'] === 'internal') return NextResponse.json({ ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const allowed = await rateLimit(`capi:${ip}`, { windowMs: 60_000, max: 30 });
  if (!allowed) return NextResponse.json({ ok: false }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const data = parsed.data;
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const clientUserAgent = req.headers.get('user-agent') ?? null;

  const userData = {
    email: data.email ?? null,
    phone: data.phone ?? null,
    clientIp,
    clientUserAgent,
    fbp: cookies._fbp ?? null,
    fbc: cookies._fbc ?? null,
  };

  const basePayload = {
    eventId: data.eventId,
    contentIds: data.contentIds,
    userData,
    eventSourceUrl: data.eventSourceUrl,
  };

  try {
    if (data.eventName === 'AddToCart') {
      await sendCapiAddToCart({
        ...basePayload,
        contentName: data.contentName,
        value: data.value ?? 0,
        currency: data.currency ?? 'TRY',
        numItems: data.numItems,
      });
    } else if (data.eventName === 'ViewContent') {
      await sendCapiViewContent({
        ...basePayload,
        contentName: data.contentName,
        contentCategory: data.contentCategory,
        value: data.value,
        currency: data.currency,
      });
    } else if (data.eventName === 'InitiateCheckout') {
      await sendCapiInitiateCheckout({
        ...basePayload,
        value: data.value ?? 0,
        currency: data.currency ?? 'TRY',
        numItems: data.numItems,
      });
    }
  } catch (err) {
    console.error('[CAPI route]', data.eventName, err);
    // Müşteriye hata göstermiyoruz — analytics hatası sessiz olmalı
  }

  return NextResponse.json({ ok: true });
}
