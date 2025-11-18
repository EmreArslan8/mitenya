import { redirect } from 'next/navigation';
import { isServer } from './checkServerOrClient';

export const getLegacyLoginUrl = (origin?: string, locale?: string) => {
  const loginUrl = `${process.env.NEXT_PUBLIC_LEGACY_AUTH_URL}/${locale ?? 'en'}/login`;
  if (isServer) return `${loginUrl}${origin ? '?origin=' + origin : ''}`;
  else return `${loginUrl}?origin=${origin ?? window?.location.href}`;
};

const redirectToLogin = (origin?: string, locale?: string) => {
  const loginUrl = `${process.env.NEXT_PUBLIC_LEGACY_AUTH_URL}/${locale ?? 'en'}/login`;
  if (isServer) redirect(`${loginUrl}${origin ? '?origin=' + origin : ''}`);
  else window.location.href = `${loginUrl}?origin=${origin ?? window?.location.href}`;
};

export const redirectToSignup = (origin?: string, locale?: string) => {
  const signupUrl = `${process.env.NEXT_PUBLIC_LEGACY_AUTH_URL}/${locale ?? 'en'}/signup`;
  if (isServer) redirect(`${signupUrl}${origin ? '?origin=' + origin : ''}`);
  else window.location.href = `${signupUrl}?origin=${origin ?? window?.location.href}`;
};

export default redirectToLogin;
