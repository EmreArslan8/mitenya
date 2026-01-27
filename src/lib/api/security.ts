import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Basit same-origin kontrolü.
 * Origin veya Referer host'u mevcut isteğin host'u ile eşleşmiyorsa 403 döner.
 */
export const validateSameOrigin = (req: NextRequest): NextResponse | null => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return null;

  const allowedOrigin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (origin && !origin.startsWith(allowedOrigin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!origin && referer && !referer.startsWith(allowedOrigin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
};

/**
 * Çerez tabanlı CSRF token üretir (HttpOnly olmayan, oturum süresi ile sınırlı).
 * Prod için SameSite=Strict/Lax ve HTTPOnly çerez stratejisi önerilir.
 */
export const getCsrfToken = (): { token: string; cookie: string } => {
  const token = crypto.randomBytes(24).toString('hex');
  const cookie = `csrf_token=${token}; Path=/; Max-Age=1800; SameSite=Lax`;
  return { token, cookie };
};

/**
 * İstek header'ındaki `x-csrf-token` ile çerezdeki `csrf_token`'ı eşleştirir.
 */
export const validateCsrfToken = (req: NextRequest): NextResponse | null => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return null;

  const headerToken = req.headers.get('x-csrf-token');
  const cookieToken =
    req.cookies.get('csrf_token')?.value ||
    req.headers
      .get('cookie')
      ?.split(';')
      .map((c) => c.trim().split('='))
      .find(([k]) => k === 'csrf_token')?.[1];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  return null;
};
