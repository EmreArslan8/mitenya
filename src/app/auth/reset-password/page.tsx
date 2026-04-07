import { cookies } from 'next/headers';
import ResetPasswordView from './view';
import { RECOVERY_COOKIE_NAME } from '@/lib/auth/recovery';

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const recoveryAllowed = cookieStore.get(RECOVERY_COOKIE_NAME)?.value === '1';

  return <ResetPasswordView recoveryAllowed={recoveryAllowed} />;
}
