import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const origin = requestUrl.origin;

  if (code) {
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

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
    }

    // Influencer kontrolü — affiliate ise /influencer'a yönlendir
    if (data?.user?.id) {
      // Önce user_id ile ara (sonraki girişler)
      let { data: affiliate } = await supabaseAdmin
        .from('affiliates')
        .select('id, user_id')
        .eq('user_id', data.user.id)
        .eq('status', 'active')
        .maybeSingle();

      // Bulunamazsa email ile ara (ilk magic link girişi)
      if (!affiliate && data.user.email) {
        const { data: affiliateByEmail } = await supabaseAdmin
          .from('affiliates')
          .select('id, user_id')
          .eq('email', data.user.email)
          .eq('status', 'active')
          .maybeSingle();

        if (affiliateByEmail) {
          // user_id'yi otomatik doldur
          await supabaseAdmin
            .from('affiliates')
            .update({ user_id: data.user.id })
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
 