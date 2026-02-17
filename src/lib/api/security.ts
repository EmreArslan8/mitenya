import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const toOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const collectAllowedOrigins = (req: NextRequest): Set<string> => {
  const origins = new Set<string>();

  // Runtime URL (default)
  origins.add(`${req.nextUrl.protocol}//${req.nextUrl.host}`);

  // Reverse-proxy aware origin
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (forwardedHost && forwardedProto) {
    origins.add(`${forwardedProto}://${forwardedHost}`);
  }

  // Primary app URL
  const publicHost = process.env.NEXT_PUBLIC_HOST_URL;
  if (publicHost) {
    const normalized = toOrigin(publicHost);
    if (normalized) origins.add(normalized);
  }

  // Optional explicit allowlist: "https://qa.mitenya.com,https://mitenya.com"
  const envAllowlist = process.env.CSRF_ALLOWED_ORIGINS;
  if (envAllowlist) {
    for (const raw of envAllowlist.split(',')) {
      const normalized = toOrigin(raw.trim());
      if (normalized) origins.add(normalized);
    }
  }

  return origins;
};

/**
 * Basit same-origin kontrolü.
 * Origin veya Referer host'u mevcut isteğin host'u ile eşleşmiyorsa 403 döner.
 */
export const validateSameOrigin = (req: NextRequest): NextResponse | null => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return null;

  const allowedOrigins = collectAllowedOrigins(req);
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const source = origin ?? referer;

  // Some clients/proxies may omit these headers; keep legacy permissive behavior.
  if (!source) return null;

  const requestOrigin = toOrigin(source);
  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
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
