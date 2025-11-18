'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Stack } from '@mui/material';
import styles from './styles';
import { signOut } from '@/lib/utils/signOut';

const resetPasswordBaseUrl = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/reset-password`;

const AccountCard = () => {
  const t = useTranslations('common.settings');
  const { customerData } = useAuth();
  const searchParams = new URLSearchParams({ email: customerData?.email ?? '' });
  const resetPasswordUrl = `${resetPasswordBaseUrl}?${searchParams}&origin=${window.location.href}`;
  return (
    <Card iconName="lock" title={t('account.cardTitle')} border>
      <Stack sx={styles.cardBody}>
        {/* <Button size="small" color="secondary" variant="outlined" href={resetPasswordUrl}>
          {t('account.changePassword')}
        </Button> */}
        <Button size="small" color="error" variant="tonal" onClick={signOut}>
          {t('account.logout')}
        </Button>
      </Stack>
    </Card>
  );
};

export default AccountCard;
