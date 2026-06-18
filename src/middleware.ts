import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
 
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }
 
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
 
  // Affiliate ref cookie — ?ref=KOD ile gelen ziyaretçilere 30 günlük cookie yaz
  const refCode = request.nextUrl.searchParams.get('ref');
  if (refCode && /^[A-Z0-9_-]{3,20}$/i.test(refCode)) {
    supabaseResponse.cookies.set('affiliate_ref', refCode.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  
  const protectedRoutes = ['/account', '/orders', '/settings', 'influencer']; 
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('login', 'true');
      return NextResponse.redirect(url);
    }
  }

  // Attribution (UTM / ttclid / landing path / referrer) — eskiden client
  // AttributionTracker yapıyordu; server-side'a taşındı ki JS/chunk yüklenmeden,
  // anında bounce eden ziyaretçide bile ilk-iniş verisi kaybolmasın.
  // (affiliate_ref yukarıda zaten yazılıyor.) Değerler ham geçilir — Next encode eder,
  // okuyan taraf (attribution.ts) decodeURIComponent ile çözer.
  {
    const sp = request.nextUrl.searchParams;
    const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const ttclid = sp.get('ttclid')?.trim();
    const hasUtm = UTM_KEYS.some((k) => sp.get(k));
    const hasRef = !!refCode && /^[A-Z0-9_-]{3,20}$/i.test(refCode);
    if (hasRef || hasUtm || ttclid) {
      const DAY = 60 * 60 * 24;
      const setAttr = (name: string, value: string, days: number) =>
        supabaseResponse.cookies.set(name, value, {
          maxAge: DAY * days,
          path: '/',
          sameSite: 'lax',
        });
      setAttr('mitenya_landing_path', request.nextUrl.pathname || '/', 30);
      const referer = request.headers.get('referer');
      if (referer) setAttr('mitenya_referrer', referer, 7);
      for (const key of UTM_KEYS) {
        const value = sp.get(key)?.trim();
        if (value) setAttr(key, value, 30);
      }
      if (ttclid) setAttr('ttclid', ttclid, 7);
    }
  }

  return supabaseResponse;
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback - session henüz oluşmamış)
     * - auth/google/callback (google callback - session henüz oluşmamış)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/google/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
