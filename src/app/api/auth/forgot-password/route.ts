import { NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  email: z.string().email().max(255),
  redirectTo: z.string().url().max(500),
});

const maskEmail = (email: string) => {
  const [localPart, domain = ''] = email.split('@');
  const visibleLocal = localPart.slice(0, 2);
  const maskedLocal = `${visibleLocal}${'*'.repeat(Math.max(localPart.length - visibleLocal.length, 1))}`;

  return `${maskedLocal}@${domain}`;
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const requestOrigin = new URL(req.url).origin;
  const requestId = crypto.randomUUID();

  console.info('[auth/forgot-password] request received', {
    requestId,
    ip,
    requestOrigin,
  });

  // IP bazlı limit: 5 istek / 10 dakika
  const ipKey = `forgot_password_ip:${ip}`;
  const ipOk = await rateLimit(ipKey, { windowMs: 10 * 60_000, max: 5 });
  if (!ipOk) {
    console.warn('[auth/forgot-password] blocked by ip rate limit', {
      requestId,
      ip,
    });
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.warn('[auth/forgot-password] invalid json', { requestId, ip });
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.warn('[auth/forgot-password] schema validation failed', {
      requestId,
      ip,
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
    // Geçersiz input — enumeration önlemi için yine 200 dön
    return Response.json({ ok: true }, { status: 200 });
  }

  const { email, redirectTo } = parsed.data;
  const maskedEmail = maskEmail(email);

  console.info('[auth/forgot-password] parsed payload', {
    requestId,
    email: maskedEmail,
    redirectTo,
  });

  // redirectTo kendi domain'imize ait olmalı — open redirect önlemi
  try {
    if (new URL(redirectTo).origin !== requestOrigin) {
      console.warn('[auth/forgot-password] blocked by origin mismatch', {
        requestId,
        email: maskedEmail,
        redirectTo,
        requestOrigin,
      });
      return Response.json({ ok: true }, { status: 200 });
    }
  } catch {
    console.warn('[auth/forgot-password] redirect url parse failed', {
      requestId,
      email: maskedEmail,
      redirectTo,
    });
    return Response.json({ ok: true }, { status: 200 });
  }

  // Email bazlı limit: 10 dakikada 1 istek (aynı adrese spam önlemi)
  const emailKey = `forgot_password_email:${email.toLowerCase()}`;
  const emailOk = await rateLimit(emailKey, { windowMs: 10 * 60_000, max: 1 });
  if (!emailOk) {
    console.warn('[auth/forgot-password] blocked by email rate limit', {
      requestId,
      email: maskedEmail,
    });
    // Email enumeration önlemi: limit aşılsa da başarı döndür
    return Response.json({ ok: true }, { status: 200 });
  }

  // Supabase admin ile gönder — hata olsa da aynı yanıt (enumeration önlemi)
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    console.error('[auth/forgot-password] supabase resetPasswordForEmail failed', {
      requestId,
      email: maskedEmail,
      redirectTo,
      error: error.message,
      code: error.code,
      status: error.status,
    });
    return Response.json({ ok: true }, { status: 200 });
  }

  console.info('[auth/forgot-password] reset email accepted by supabase', {
    requestId,
    email: maskedEmail,
    redirectTo,
  });

  return Response.json({ ok: true }, { status: 200 });
}
