'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Stack, Typography, Select, MenuItem, Fade } from '@mui/material';
import { ChevronRight } from '@/components/icons';
import { Moon, Stars, Sparkles, Home } from 'lucide-react';
import Link from '@/components/common/Link';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { Collection } from '@/lib/api/supabaseShop';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import { useStyles } from './styles';

type NightCareViewProps = {
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

const FloatingParticle = ({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) => (
  <Box
    sx={{
      position: 'absolute',
      left,
      top,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(200,180,255,0.4) 50%, transparent 70%)',
      animation: `float ${4 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
      filter: 'blur(1px)',
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 0.6 },
        '50%': { transform: 'translateY(-20px) scale(1.2)', opacity: 1 },
      },
    }}
  />
);

const NightCareView = ({ initialData, collection }: NightCareViewProps) => {
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
    setIsNavigating(false);
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
        {/* Animated Background Elements */}
        <Box sx={styles.starsContainer}>
          {[...Array(30)].map((_, i) => (
            <Box
              key={i}
              sx={{
                ...styles.star,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              }}
            />
          ))}
        </Box>

        {/* Floating Particles */}
        <FloatingParticle delay={0} size={6} left="10%" top="30%" />
        <FloatingParticle delay={1} size={4} left="85%" top="20%" />
        <FloatingParticle delay={2} size={8} left="70%" top="60%" />
        <FloatingParticle delay={0.5} size={5} left="25%" top="70%" />
        <FloatingParticle delay={1.5} size={7} left="90%" top="80%" />

        {/* Moon Glow */}
        <Box sx={styles.moonGlow} />

        {/* Content */}
        <Fade in={mounted} timeout={1000}>
          <Stack sx={styles.heroContent}>
            <Stack direction="row" alignItems="center" gap={1.5} sx={styles.badge}>
              <Moon size={16} />
              <Typography sx={styles.badgeText}>ÖZEL KOLEKSİYON</Typography>
              <Stars size={16} />
            </Stack>

            <Typography variant="h1" sx={styles.heroTitle}>
              Gece Bakımı
            </Typography>

            <Typography sx={styles.heroSubtitle}>
              Cildiniz uyurken yenilensin
            </Typography>

            <Typography sx={styles.heroDescription}>
              Gece serumları, uyku maskeleri ve yoğun bakım formülleriyle
              <br />
              sabaha ışıldayan bir cilde uyanın
            </Typography>

            <Stack direction="row" gap={3} sx={styles.features}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Sparkles size={18} style={{ color: '#C9B8FF' }} />
                <Typography sx={styles.featureText}>Hücre Yenilenmesi</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <Moon size={18} style={{ color: '#C9B8FF' }} />
                <Typography sx={styles.featureText}>Derin Nemlendirme</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <Stars size={18} style={{ color: '#C9B8FF' }} />
                <Typography sx={styles.featureText}>Anti-Aging</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Fade>
      </Box>

      {/* Products Section */}
      <Stack sx={styles.productsSection}>
        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" sx={styles.breadcrumb}>
          <Link href="/">
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Home size={14} />
              <Typography component="span">Ana Sayfa</Typography>
            </Stack>
          </Link>
          <ChevronRight size={14} />
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {collection.name}
          </Typography>
        </Stack>

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

export default NightCareView;
