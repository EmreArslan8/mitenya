// src/app/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  const code = requestUrl.searchParams.get('code');
  const stateParam = requestUrl.searchParams.get('state');

  console.log('[google/callback] incoming', {
    codePresent: !!code,
    stateParam,
  });

  if (!code || !stateParam) {
    console.error('[google/callback] missing code or state');
    return NextResponse.redirect(
      new URL('/?auth_error=google', origin),
    );
  }

  const { next } = JSON.parse(
    decodeURIComponent(stateParam),
  ) as { next?: string };

  const redirectAfterLogin = next || '/';

  try {
    console.log('[google/callback] exchanging code for tokens', {
      GOOGLE_REDIRECT_URI,
      GOOGLE_CLIENT_ID,
      hasSecret: !!GOOGLE_CLIENT_SECRET,
    });

    // 1️⃣ Google → token exchange
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[google/callback] Token exchange FAILED', {
        status: tokenRes.status,
        body: errText,
      });

      return NextResponse.redirect(
        new URL('/?auth_error=google_token', origin),
      );
    }

    const tokenJson = await tokenRes.json();
    const id_token = tokenJson.id_token as string | undefined;

    if (!id_token) {
      console.error('[google/callback] no id_token in token response', tokenJson);
      return NextResponse.redirect(
        new URL('/?auth_error=no_id_token', origin),
      );
    }

    console.log('[google/callback] token response', {
      access_token_present: !!tokenJson.access_token,
      id_token_present: !!id_token,
    });

    // 2️⃣ Supabase login (COOKIE yazarak)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Server Component'te cookie set edilemez, ignore
            }
          },
        },
      },
    );

    console.log('[google/callback] signing in to Supabase');

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    });

    if (error) {
      console.error('[google/callback] Supabase signInWithIdToken ERROR', error);
      return NextResponse.redirect(
        new URL('/?auth_error=supabase', origin),
      );
    }

    console.log(
      '[google/callback] SUCCESS → redirecting to',
      redirectAfterLogin,
    );

    // ⚠ Mutlaka ABSOLUTE URL kullan
    return NextResponse.redirect(
      new URL(redirectAfterLogin, origin),
    );
  } catch (e) {
    console.error('[google/callback] FATAL ERROR', e);
    return NextResponse.redirect(
      new URL('/?auth_error=callback_500', origin),
    );
  }
}
