'use client';

import { Box, Stack, Typography } from '@mui/material';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Link from '@/components/common/Link';
import { withPalette } from '@/theme/ThemeRegistry';

interface CookieConsentBannerProps {
  open: boolean;
  policyHref: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onManage: () => void;
}

const useStyles = withPalette((palette) => ({
  container: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: { xs: 72, sm: 16 },
    zIndex: 1400,
    px: { xs: 2, sm: 3 },
    pointerEvents: 'none',
  },
  card: {
    pointerEvents: 'auto',
    background: palette.bg.main,
    borderColor: palette.tertiary.light,
    boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.12)',
  },
  actions: {
    flexWrap: 'wrap',
    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
  },
}));

const CookieConsentBanner = ({
  open,
  policyHref,
  onAcceptAll,
  onRejectAll,
  onManage,
}: CookieConsentBannerProps) => {
  const styles = useStyles();

  if (!open) return null;

  return (
    <Box sx={styles.container}>
      <Card border sx={styles.card}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 2, sm: 3 }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          sx={{ p: { xs: 2, sm: 2.5 } }}
        >
          <Stack gap={0.75} sx={{ maxWidth: 700 }}>
            <Typography variant="cardTitle">Çerez Tercihleri</Typography>
            <Typography variant="body" sx={{ fontSize: 13, color: 'text.secondary' }}>
              Sitemizin çalışması için zorunlu çerezler kullanıyoruz. Analitik ve pazarlama
              çerezleri için izninizi isteyeceğiz. Tercihlerinizi dilediğiniz zaman
              değiştirebilirsiniz.{' '}
              <Link href={policyHref} colored>
                Çerez Politikası
              </Link>
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} sx={styles.actions}>
            <Button size="small" variant="outlined" color="neutral" onClick={onRejectAll}>
              Reddet
            </Button>
            <Button size="small" variant="outlined" color="primary" onClick={onManage}>
              Tercihleri Yönet
            </Button>
            <Button size="small" variant="contained" color="primary" onClick={onAcceptAll}>
              Tümünü Kabul Et
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default CookieConsentBanner;
