'use client';

import Button from '@/components/common/Button';
import { withPalette } from '@/theme/ThemeRegistry';
import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';

/**
 * Boş sepet görseli.
 *
 * unDraw'ın "Shopping favorites" illüstrasyonu (açık lisans, atıf gerekmez).
 * İndirildikten sonra üç düzenleme yapıldı, dosya yeniden indirilirse
 * tekrarlanmalı:
 *   1. Mor aksan -> marka kırmızısı #C1121F, koyu lacivertler -> #1C1C1E/#2C2C2E
 *   2. Ten tonu #9f616a -> bej #E3C7A6; tişörtün pembe alt parçası #ed9da0 ->
 *      kırmızının koyu tonu #9E0F1A
 *   3. Kalp, çantanın arkasından taşıyordu; bir <g> ile ölçeklenip çantanın ön
 *      yüzünün ortasına taşındı
 */
const ILLUSTRATION = {
  src: '/static/images/illustrations/shopping-favorites.svg',
  /** Kaynak viewBox — oranı bozmamak için birebir bu değerler. */
  width: 531,
  height: 800,
};

const useStyles = withPalette((palette) => ({
  root: {
    alignItems: 'center',
    textAlign: 'center',
    py: { xs: 5, md: 9 },
    px: 2,
    gap: 1,
  },
  illustration: {
    width: '100%',
    maxWidth: { xs: 170, md: 220 },
    height: 'auto',
  },
  title: {
    mt: { xs: 2.5, md: 4 },
    fontSize: { xs: 22, md: 28 },
    lineHeight: 1.25,
    fontWeight: 600,
    color: palette.text.main,
  },
  subtitle: {
    mt: 1,
    maxWidth: 420,
    fontSize: { xs: 14, md: 16 },
    lineHeight: 1.5,
    color: palette.text.mediumLight,
  },
  action: {
    mt: { xs: 3, md: 4 },
    minWidth: { xs: '100%', sm: 260 },
    py: 1.5,
  },
}));

export interface EmptyCartProps {
  /** Sepet drawer/modal içinde daha kompakt görünsün diye. */
  compact?: boolean;
  /** CTA'ya basınca drawer'ı kapatmak gibi ek işler için. */
  onAction?: () => void;
}

const EmptyCart = ({ compact = false, onAction }: EmptyCartProps) => {
  const styles = useStyles();

  return (
    <Stack sx={[styles.root, compact && { py: { xs: 3, md: 4 } }]}>
      {/* Genişlik sarmalayıcıda: MUI `Box component={Image}` kalıbı width/height
          prop'larını sistem prop'u sanıp Image'a iletmiyor. */}
      <Box sx={[styles.illustration, compact && { maxWidth: { xs: 140, md: 160 } }]}>
        <Image
          src={ILLUSTRATION.src}
          alt=""
          width={ILLUSTRATION.width}
          height={ILLUSTRATION.height}
          aria-hidden
          // Loader zaten SVG'ye dokunmuyor; unoptimized olmadan Next custom
          // loader'in width'i yoksaydigini gorup hata veriyor.
          unoptimized
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
      <Typography component="h2" sx={styles.title}>
        Sepetin boş görünüyor
      </Typography>
      <Typography sx={styles.subtitle}>
        Cildinin ihtiyacı olan bakımı keşfetmeye ne dersin?
      </Typography>
      <Button
        variant="contained"
        href="/"
        onClick={onAction}
        sx={styles.action}
        dataLayerEventId="empty_cart_start_shopping"
      >
        Alışverişe Başla
      </Button>
    </Stack>
  );
};

export default EmptyCart;
