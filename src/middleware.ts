import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
 
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  supabaseResponse.headers.set('Accept-CH', 'Sec-CH-Viewport-Width, Sec-CH-UA-Mobile');
  supabaseResponse.headers.set('Critical-CH', 'Sec-CH-Viewport-Width, Sec-CH-UA-Mobile');
  supabaseResponse.headers.append('Vary', 'Sec-CH-Viewport-Width');
  supabaseResponse.headers.append('Vary', 'Sec-CH-UA-Mobile');

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
