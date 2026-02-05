import { useTheme } from '@mui/material';
import { useMemo } from 'react';

export const useStyles = () => {
  const theme = useTheme();

  return useMemo(
    () => ({
      pageWrapper: {
        minHeight: '100vh',
        background: '#0A0A0F',
      },

      // Hero Section
      hero: {
        position: 'relative',
        minHeight: { xs: 280, sm: 320, md: 360 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(88, 60, 140, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(60, 40, 100, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse 50% 30% at 20% 90%, rgba(100, 70, 150, 0.25) 0%, transparent 50%),
          linear-gradient(180deg, #0D0D14 0%, #12121A 50%, #0A0A0F 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: 0.03,
          pointerEvents: 'none',
        },
      },

      starsContainer: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      },

      star: {
        position: 'absolute',
        borderRadius: '50%',
        background: '#fff',
        animation: 'twinkle 2s ease-in-out infinite',
        '@keyframes twinkle': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
      },

      moonGlow: {
        position: 'absolute',
        top: { xs: -40, md: -50 },
        right: { xs: -30, md: 80 },
        width: { xs: 150, md: 200 },
        height: { xs: 150, md: 200 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200, 190, 255, 0.15) 0%, rgba(150, 140, 200, 0.05) 40%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      },

      heroContent: {
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        px: 3,
        maxWidth: 700,
      },

      badge: {
        justifyContent: 'center',
        mb: 2,
        color: '#9D8CCC',
      },

      badgeText: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 3,
        color: '#9D8CCC',
      },

      heroTitle: {
        fontSize: { xs: 32, sm: 42, md: 52 },
        fontWeight: 800,
        lineHeight: 1,
        mb: 1.5,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #C9B8FF 50%, #8B7ACC 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 80px rgba(180, 160, 255, 0.5)',
      },

      heroSubtitle: {
        fontSize: { xs: 15, sm: 18, md: 20 },
        fontWeight: 500,
        color: '#B8A8E8',
        mb: 1.5,
        letterSpacing: 1,
      },

      heroDescription: {
        fontSize: { xs: 13, sm: 14 },
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 1.6,
        mb: 2.5,
        display: { xs: 'none', sm: 'block' },
      },

      features: {
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: { xs: 2, sm: 3 },
        display: { xs: 'none', sm: 'flex' },
      },

      featureText: {
        fontSize: { xs: 12, sm: 14 },
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.5,
      },

      // Products Section
      productsSection: {
        px: { xs: 1.5, sm: 3 },
        py: { xs: 3, sm: 4 },
        background: '#FAFAFA',
        borderRadius: { xs: '24px 24px 0 0', sm: '32px 32px 0 0' },
        mt: -3,
        position: 'relative',
        zIndex: 3,
      },

      breadcrumb: {
        gap: 0.5,
        mb: 2,
        fontSize: 14,
        color: '#6E6E73',
        '& a': {
          color: '#6E6E73',
          textDecoration: 'none',
          transition: 'color 0.2s',
          '&:hover': {
            color: '#6B5B95',
          },
        },
      },

      toolbar: {
        mb: 2.5,
      },

      accentLine: {
        width: 4,
        height: 28,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #6B5B95 0%, #9D8CCC 100%)',
      },

      sectionTitle: {
        fontWeight: 700,
        color: '#1C1C1E',
      },

      sortSelect: {
        minWidth: 200,
        background: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E5E5EA',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#6B5B95',
        },
      },
    }),
    [theme]
  );
};
