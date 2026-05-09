// src/app/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isSafeRedirect } from '@/lib/utils/isValidUrl';

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

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL('/?auth_error=google', origin));
  }

  // State parse + CSRF nonce doğrulama
  let next: string | undefined;
  let nonce: string | undefined;
  try {
    // URLSearchParams.get() zaten decode ediyor — tekrar decodeURIComponent çağrılmıyor
    const parsed = JSON.parse(stateParam) as {
      next?: string;
      nonce?: string;
    };
    next = parsed.next;
    nonce = parsed.nonce;
  } catch {
    return NextResponse.redirect(new URL('/?auth_error=invalid_state', origin));
  }

  const cookieStore = await cookies();
  const storedNonce = cookieStore.get('oauth_nonce')?.value;

  if (!storedNonce || !nonce || storedNonce !== nonce) {
    return NextResponse.redirect(new URL('/?auth_error=csrf', origin));
  }

  const safeRedirect = isSafeRedirect(next ?? '/') ? (next ?? '/') : '/';

  try {
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
      return NextResponse.redirect(new URL('/?auth_error=google_token', origin));
    }

    const tokenJson = await tokenRes.json();
    const id_token = tokenJson.id_token as string | undefined;

    if (!id_token) {
      return NextResponse.redirect(new URL('/?auth_error=no_id_token', origin));
    }

    // 2️⃣ Supabase login (COOKIE yazarak)
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

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    });

    if (error) {
      return NextResponse.redirect(new URL('/?auth_error=supabase', origin));
    }

    // Nonce cookie'yi kullanıldıktan sonra temizle
    const response = NextResponse.redirect(new URL(safeRedirect, origin));
    response.cookies.delete('oauth_nonce');
    return response;
  } catch {
    return NextResponse.redirect(new URL('/?auth_error=callback_500', origin));
  }
}
