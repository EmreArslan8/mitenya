import { NextResponse } from 'next/server';
import { RECOVERY_COOKIE_NAME, RECOVERY_COOKIE_PATH } from '@/lib/auth/recovery';

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(RECOVERY_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: RECOVERY_COOKIE_PATH,
    maxAge: 0,
  });
  return response;
}
