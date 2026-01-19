// src/app/auth/google/login/route.ts
import { NextResponse } from 'next/server';

const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get('next') || '/';

  // 🔹 Sade JSON string, encode YOK
  const state = JSON.stringify({ next });

  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });

  return NextResponse.redirect(url);
}
