'use client';

import Button from '@/components/common/Button';
import { withPalette } from '@/theme/ThemeRegistry';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const useStyles = withPalette((palette) => ({
  root: {
    alignItems: 'center',
    textAlign: 'center',
    py: { xs: 7, md: 12 },
    px: 2,
  },
  /**
   * Dekoratif rakam. Ekran genişliğiyle büyüyor ama clamp'in üst sınırı var,
   * yoksa geniş ekranda başlığı ezip sayfanın konusu "404" oluyor.
   */
  numeral: {
    fontSize: 'clamp(84px, 18vw, 168px)',
    fontWeight: 800,
    lineHeight: 0.85,
    letterSpacing: '-0.05em',
    color: palette.text.main,
    userSelect: 'none',
  },
  /** Ortadaki sıfır tek aksan — başka renk kullanmıyoruz. */
  numeralAccent: { color: palette.accentRed.main },
  title: {
    mt: { xs: 3, md: 4 },
    fontSize: { xs: 22, md: 28 },
    lineHeight: 1.25,
    fontWeight: 600,
    color: palette.text.main,
  },
  subtitle: {
    mt: 1,
    maxWidth: 440,
    fontSize: { xs: 14, md: 16 },
    lineHeight: 1.5,
    color: palette.text.mediumLight,
  },
  actions: {
    mt: { xs: 3, md: 4 },
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1.5,
    width: '100%',
    maxWidth: 440,
    '& > *': { flex: 1 },
  },
  supportLine: {
    mt: 3,
    fontSize: 13,
    color: palette.text.mediumLight,
  },
  supportLink: {
    color: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
}));

const NotFoundView = () => {
  const styles = useStyles();

  return (
    <Stack sx={styles.root}>
      <Typography component="p" sx={styles.numeral} aria-hidden>
        4<Box component="span" sx={styles.numeralAccent}>0</Box>4
      </Typography>

      <Typography component="h1" sx={styles.title}>
        Aradığın sayfayı bulamadık
      </Typography>
      <Typography sx={styles.subtitle}>
        Bağlantı taşınmış, adı değişmiş ya da hiç var olmamış olabilir.
      </Typography>

      <Stack sx={styles.actions}>
        <Button variant="contained" href="/" sx={{ py: 1.5 }}>
          Ana Sayfaya Dön
        </Button>
        <Button variant="outlined" color="secondary" href="/search" sx={{ py: 1.5 }}>
          Ürünleri Keşfet
        </Button>
      </Stack>

      <Typography sx={styles.supportLine}>
        Yardıma mı ihtiyacın var?{' '}
        <Box component={Link} href="/iletisim" sx={styles.supportLink}>
          Bize ulaş
        </Box>
      </Typography>
    </Stack>
  );
};

export default NotFoundView;
