import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');

  if (key !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'mitenya.com';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const response = NextResponse.redirect(`${proto}://${host}/`);
  response.cookies.set('traffic_type', 'internal', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
