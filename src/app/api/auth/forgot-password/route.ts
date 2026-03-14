import { NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  email: z.string().email().max(255),
  redirectTo: z.string().url().max(500),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const requestOrigin = new URL(req.url).origin;

  // IP bazlı limit: 5 istek / 10 dakika
  const ipKey = `forgot_password_ip:${ip}`;
  const ipOk = await rateLimit(ipKey, { windowMs: 10 * 60_000, max: 5 });
  if (!ipOk) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Geçersiz input — enumeration önlemi için yine 200 dön
    return Response.json({ ok: true }, { status: 200 });
  }

  const { email, redirectTo } = parsed.data;

  // redirectTo kendi domain'imize ait olmalı — open redirect önlemi
  try {
    if (new URL(redirectTo).origin !== requestOrigin) {
      return Response.json({ ok: true }, { status: 200 });
    }
  } catch {
    return Response.json({ ok: true }, { status: 200 });
  }

  // Email bazlı limit: 10 dakikada 1 istek (aynı adrese spam önlemi)
  const emailKey = `forgot_password_email:${email.toLowerCase()}`;
  const emailOk = await rateLimit(emailKey, { windowMs: 10 * 60_000, max: 1 });
  if (!emailOk) {
    // Email enumeration önlemi: limit aşılsa da başarı döndür
    return Response.json({ ok: true }, { status: 200 });
  }

  // Supabase admin ile gönder — hata olsa da aynı yanıt (enumeration önlemi)
  await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

  return Response.json({ ok: true }, { status: 200 });
}
