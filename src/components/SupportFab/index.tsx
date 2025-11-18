'use client';

import { Stack, Typography } from '@mui/material';
import SupportButton from '../SupportButton';
import useStyles from './styles';
import useLocale from '@/lib/hooks/useLocale';

const SupportFab = () => {
  const t = useTranslations('common');
  const { locale } = useLocale();
  const styles = useStyles();

  return (
    <Stack sx={styles.container}>
      <SupportButton
        size="small"
        customText={
          <Stack sx={styles.text}>
            <Typography fontSize={10} fontWeight={700} lineHeight="normal">
              {locale === 'he' ? 'WhatsApp' : 'Telegram'}
            </Typography>
            <Typography fontSize={12} fontWeight={600} lineHeight="normal">
              {t('contactUs')}
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
};

export default SupportFab;
