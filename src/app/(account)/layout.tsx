import { ReactNode } from 'react';
import AccountPagesLayoutView from './layoutView';

const AccountPagesLayout = ({ children }: { children: ReactNode }) => {
  return <AccountPagesLayoutView>{children}</AccountPagesLayoutView>;
};

export const dynamic = 'force-dynamic';

export default AccountPagesLayout;
