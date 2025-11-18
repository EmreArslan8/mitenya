import { getSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { pushItemToDataLayer } from './googleAnalytics';

export const signOut = async () => {
  const session = await getSession();
  const userId = session?.user.id;
  userId && pushItemToDataLayer({ event: 'log_out', userId });
  nextAuthSignOut({
    callbackUrl: process.env.NEXT_PUBLIC_HOST_URL,
  });
};
