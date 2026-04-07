import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getRecoveryCookieOptions, RECOVERY_COOKIE_NAME } from '@/lib/auth/recovery';
import { isSafeRedirect } from '@/lib/utils/isValidUrl';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const rawNext = requestUrl.searchParams.get('next') ?? '/';
  const next = isSafeRedirect(rawNext) ? rawNext : '/';
  const origin = requestUrl.origin;

  if (code || tokenHash) {
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
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component'te cookie set edilemez, ignore
            }
          },
        },
      }
    );

    let error: Error | null = null;
    let user: { id: string; email: string | null } | null = null;

    if (code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      error = result.error;
      user = result.data.user
        ? { id: result.data.user.id, email: result.data.user.email ?? null }
        : null;
    } else if (tokenHash && type) {
      const result = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });
      error = result.error;
      user = result.data.user
        ? { id: result.data.user.id, email: result.data.user.email ?? null }
        : null;
    }

    if (error) {
      // Hata mesajı URL'e gömülmüyor — iç detay sızmasın
      return NextResponse.redirect(`${origin}/auth/error`);
    }

    if (type === 'recovery') {
      cookieStore.set(RECOVERY_COOKIE_NAME, '1', getRecoveryCookieOptions());
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Influencer kontrolü — affiliate ise /influencer'a yönlendir
    if (user?.id) {
      // Önce user_id ile ara (sonraki girişler)
      let { data: affiliate } = await supabaseAdmin
        .from('affiliates')
        .select('id, user_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Bulunamazsa email ile ara (ilk magic link girişi)
      if (!affiliate && user.email) {
        const { data: affiliateByEmail } = await supabaseAdmin
          .from('affiliates')
          .select('id, user_id')
          .eq('email', user.email)
          .eq('status', 'active')
          .maybeSingle();

        if (affiliateByEmail) {
          // user_id'yi otomatik doldur
          await supabaseAdmin
            .from('affiliates')
            .update({ user_id: user.id })
            .eq('id', affiliateByEmail.id);
          affiliate = affiliateByEmail;
        }
      }

      if (affiliate) {
        return NextResponse.redirect(`${origin}/influencer`);
      }
    }
  }

  // Redirect to origin or specified next page
  return NextResponse.redirect(`${origin}${next}`);
}
 
