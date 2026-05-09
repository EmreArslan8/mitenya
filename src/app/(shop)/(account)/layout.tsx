import { ReactNode } from 'react';
import { fetchUserReviewsCount } from '@/lib/api/supabaseReviews';
import AccountPagesLayoutView from './layoutView';

const AccountPagesLayout = async ({ children }: { children: ReactNode }) => {
  const reviewCount = await fetchUserReviewsCount();
  return <AccountPagesLayoutView reviewCount={reviewCount}>{children}</AccountPagesLayoutView>;
};

export const dynamic = 'force-dynamic';

export default AccountPagesLayout;
