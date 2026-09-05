'use client';

import { Box, Stack, Typography } from '@mui/material';

/**
 * Sol sutundaki marka seridi: sonsuz kayan logo marquee.
 * prefers-reduced-motion acikken hareket duruyor.
 */

const BRANDS = [
  { name: 'Beauty of Joseon', src: '/static/images/brands/beauty-of-joseon.svg' },
  { name: 'numbuzin', src: '/static/images/brands/numbuzin.svg' },
  { name: 'Celimax', src: '/static/images/brands/celimax.svg' },
  { name: 'Mary & May', src: '/static/images/brands/mary-and-may.svg' },
  { name: 'A313', src: '/static/images/brands/a313.svg' },
];

const Showcase = () => (
  <Stack sx={{ gap: 1, maxWidth: 460, width: '100%' }}>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', letterSpacing: '0.14em', textTransform: 'uppercase' }}
    >
      Mitenya&apos;da yer alan markalar
    </Typography>

    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        // Kenarlarda yumusak kayboluş
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: 'max-content',
          alignItems: 'center',
          animation: 'mitenyaMarquee 28s linear infinite',
          '@keyframes mitenyaMarquee': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-50%)' },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        {[...BRANDS, ...BRANDS].map((brand, index) => (
          <Box
            key={`${brand.name}-${index}`}
            sx={{
              flex: '0 0 auto',
              px: 3,
              color: 'text.light',
              opacity: 0.75,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={brand.src}
              alt={brand.name}
              loading="lazy"
              sx={{ height: 18, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  </Stack>
);

export default Showcase;
