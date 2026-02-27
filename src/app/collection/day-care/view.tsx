
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Stack, Typography, Select, MenuItem, Fade } from '@mui/material';
import { Sun, Sparkles, Shield, Droplets } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { Collection } from '@/lib/api/supabaseShop';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import { useStyles } from './styles';

type DayCareViewProps = {
  initialData: ShopSearchResponse;
  collection: Collection;
};

const SORT_LABELS: Record<ShopSearchSort, string> = {
  rct: 'Önerilen',
  disc: 'İndirim Oranına Göre',
  pasc: 'Fiyat (Düşükten Yükseğe)',
  pdsc: 'Fiyat (Yüksekten Düşüğe)',
  rcc: 'Önerilen',
  bst: 'En Çok Satan',
  fav: 'En Favori',
  asc: 'Fiyat (Düşükten Yükseğe)',
  dsc: 'Fiyat (Yüksekten Düşüğe)',
};

const SunRay = ({ rotation, delay }: { rotation: number; delay: number }) => (
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 2,
      height: { xs: 80, md: 120 },
      background: 'linear-gradient(180deg, rgba(255, 200, 100, 0.6) 0%, transparent 100%)',
      transformOrigin: 'top center',
      transform: `rotate(${rotation}deg)`,
      animation: `rayPulse 3s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      '@keyframes rayPulse': {
        '0%, 100%': { opacity: 0.3, transform: `rotate(${rotation}deg) scaleY(1)` },
        '50%': { opacity: 0.7, transform: `rotate(${rotation}deg) scaleY(1.2)` },
      },
    }}
  />
);

const FloatingBubble = ({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) => (
  <Box
    sx={{
      position: 'absolute',
      left,
      top,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255, 220, 150, 0.3) 50%, transparent 70%)',
      animation: `rise ${5 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
      boxShadow: 'inset 0 -2px 4px rgba(255, 180, 100, 0.2)',
      '@keyframes rise': {
        '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 0.6 },
        '50%': { transform: 'translateY(-30px) scale(1.1)', opacity: 0.9 },
      },
    }}
  />
);

const DayCareView = ({ initialData }: DayCareViewProps) => {
  const allowedUiSorts = UI_SORT_OPTIONS as readonly ShopSearchSort[];
  const router = useRouter();
  const searchParams = useSearchParams();
  const styles = useStyles();
  const [sort, setSort] = useState<ShopSearchSort>(
    (searchParams?.get('sort') as ShopSearchSort) ?? 'rct'
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const products = initialData.products ?? [];
  const visibleSortOptions = (initialData.sortOptions ?? ['rct', 'pdsc', 'pasc']).filter(
    (opt) => allowedUiSorts.includes(opt)
  );
  const selectedSort = visibleSortOptions.includes(sort) ? sort : (visibleSortOptions[0] ?? 'rct');

  useEffect(() => {
    setMounted(true);
    setSort((searchParams?.get('sort') as ShopSearchSort) ?? 'rct');
  }, [searchParams]);

  const handleSortChange = (value: ShopSearchSort) => {
    setSort(value);
    setIsNavigating(true);
    const params = new URLSearchParams(searchParams ?? undefined);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  return (
    <Stack sx={styles.pageWrapper}>
      {/* Immersive Hero Section */}
      <Box sx={styles.hero}>
        {/* Sun Rays */}
        <Box sx={styles.sunContainer}>
          {[...Array(12)].map((_, i) => (
            <SunRay key={i} rotation={i * 30} delay={i * 0.2} />
          ))}
          <Box sx={styles.sunCore} />
        </Box>

        {/* Floating Bubbles */}
        <FloatingBubble delay={0} size={12} left="15%" top="40%" />
        <FloatingBubble delay={1.2} size={8} left="80%" top="30%" />
        <FloatingBubble delay={0.6} size={16} left="65%" top="65%" />
        <FloatingBubble delay={1.8} size={10} left="25%" top="75%" />
        <FloatingBubble delay={0.3} size={14} left="88%" top="55%" />

        {/* Light Flares */}
        <Box sx={styles.lightFlare1} />
        <Box sx={styles.lightFlare2} />

        {/* Content */}
        <Fade in={mounted} timeout={1000}>
          <Stack sx={styles.heroContent}>
            <Stack direction="row" alignItems="center" gap={1.5} sx={styles.badge}>
              <Sun size={16} />
              <Typography sx={styles.badgeText}>ÖZEL KOLEKSİYON</Typography>
              <Sparkles size={16} />
            </Stack>

            <Typography variant="h1" sx={styles.heroTitle}>
              Günlük Bakım Koleksiyonu
            </Typography>

            <Typography sx={styles.heroSubtitle}>
              Güne ışıldayarak başlayın
            </Typography>

            <Typography sx={styles.heroDescription}>
              SPF korumalı nemlendiriciler, aydınlatıcı serumlar ve hafif formüllerle
              <br />
              cildinizi gün boyu koruyun ve besleyin
            </Typography>

            <Stack direction="row" gap={3} sx={styles.features}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Shield size={18} style={{ color: '#FF9F43' }} />
                <Typography sx={styles.featureText}>UV Koruma</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <Droplets size={18} style={{ color: '#FF9F43' }} />
                <Typography sx={styles.featureText}>Hafif Nemlendirme</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <Sparkles size={18} style={{ color: '#FF9F43' }} />
                <Typography sx={styles.featureText}>Aydınlatma</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Fade>
      </Box>

      {/* Products Section */}
      <Stack sx={styles.productsSection}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={styles.toolbar}
        >
          <Stack direction="row" alignItems="center" gap={2}>
            <Box sx={styles.accentLine} />
            <Typography variant="h2" sx={styles.sectionTitle}>
              {initialData.totalCount} Ürün
            </Typography>
          </Stack>

          <Select
            size="small"
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value as ShopSearchSort)}
            sx={styles.sortSelect}
          >
            {visibleSortOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {SORT_LABELS[opt] ?? opt}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Grid container columnSpacing={2.5} rowSpacing={3}>
          {products.map((p, index) => (
            <Fade in={mounted} timeout={600} style={{ transitionDelay: `${index * 50}ms` }} key={p.url}>
              <Grid item xs={6} sm={4} md={3}>
                <ProductCard data={p} />
              </Grid>
            </Fade>
          ))}
          {isNavigating &&
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={`skeleton-${i}`}>
                <ProductCardSkeleton />
              </Grid>
            ))}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DayCareView;
