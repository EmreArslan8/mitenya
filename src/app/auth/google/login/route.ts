// src/app/auth/google/login/route.ts
import { NextResponse } from 'next/server';
import { isSafeRedirect } from '@/lib/utils/isValidUrl';

const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawNext = searchParams.get('next') || '/';
  const next = isSafeRedirect(rawNext) ? rawNext : '/';

  // CSRF koruması: nonce oluştur, cookie + state'e ekle
  const nonce = crypto.randomUUID();
  const state = JSON.stringify({ next, nonce });

  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });

  const response = NextResponse.redirect(url);
  response.cookies.set('oauth_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 dakika
    path: '/',
  });
  return response;
}
