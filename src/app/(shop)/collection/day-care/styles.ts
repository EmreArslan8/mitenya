import { useTheme } from '@mui/material';
import { useMemo } from 'react';

export const useStyles = () => {
  const theme = useTheme();

  return useMemo(
    () => ({
      pageWrapper: {
        minHeight: '100vh',
        background: '#FFFBF5',
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
          radial-gradient(ellipse 100% 80% at 50% -20%, rgba(255, 200, 100, 0.5) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(255, 180, 120, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse 50% 30% at 10% 80%, rgba(255, 220, 180, 0.2) 0%, transparent 50%),
          linear-gradient(180deg, #FFF8E8 0%, #FFFBF2 50%, #FFFFFF 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: 0.02,
          pointerEvents: 'none',
        },
      },

      sunContainer: {
        position: 'absolute',
        top: { xs: -80, md: -100 },
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: 160, md: 200 },
        height: { xs: 160, md: 200 },
      },

      sunCore: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: 60, md: 80 },
        height: { xs: 60, md: 80 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 220, 100, 1) 0%, rgba(255, 180, 60, 0.8) 50%, rgba(255, 150, 50, 0.4) 100%)',
        boxShadow: '0 0 60px rgba(255, 180, 100, 0.6), 0 0 120px rgba(255, 150, 80, 0.3)',
        animation: 'sunPulse 4s ease-in-out infinite',
        '@keyframes sunPulse': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', boxShadow: '0 0 60px rgba(255, 180, 100, 0.6), 0 0 120px rgba(255, 150, 80, 0.3)' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.05)', boxShadow: '0 0 80px rgba(255, 180, 100, 0.8), 0 0 160px rgba(255, 150, 80, 0.4)' },
        },
      },

      lightFlare1: {
        position: 'absolute',
        top: { xs: 40, md: 60 },
        left: { xs: '15%', md: '25%' },
        width: { xs: 80, md: 100 },
        height: { xs: 80, md: 100 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 230, 180, 0.4) 0%, transparent 70%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      },

      lightFlare2: {
        position: 'absolute',
        top: { xs: 70, md: 100 },
        right: { xs: '10%', md: '20%' },
        width: { xs: 60, md: 80 },
        height: { xs: 60, md: 80 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 200, 150, 0.3) 0%, transparent 70%)',
        filter: 'blur(15px)',
        pointerEvents: 'none',
      },

      heroContent: {
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        px: 3,
        maxWidth: 700,
        mt: { xs: 4, md: 5 },
      },

      badge: {
        justifyContent: 'center',
        mb: 2,
        color: '#D97706',
      },

      badgeText: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 3,
        color: '#D97706',
      },

      heroTitle: {
        fontSize: { xs: 32, sm: 42, md: 52 },
        fontWeight: 800,
        lineHeight: 1,
        mb: 1.5,
        background: 'linear-gradient(180deg, #1C1C1E 0%, #D97706 50%, #F59E0B 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },

      heroSubtitle: {
        fontSize: { xs: 15, sm: 18, md: 20 },
        fontWeight: 500,
        color: '#92400E',
        mb: 1.5,
        letterSpacing: 1,
      },

      heroDescription: {
        fontSize: { xs: 13, sm: 14 },
        color: 'rgba(60, 40, 20, 0.7)',
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
        color: '#78350F',
        letterSpacing: 0.5,
      },

      // Products Section
      productsSection: {
        px: { xs: 1.5, sm: 3 },
        py: { xs: 3, sm: 4 },
        background: '#FFFFFF',
        borderRadius: { xs: '24px 24px 0 0', sm: '32px 32px 0 0' },
        mt: -3,
        position: 'relative',
        zIndex: 3,
        boxShadow: '0 -10px 40px rgba(255, 180, 100, 0.1)',
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
            color: '#D97706',
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
        background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
      },

      sectionTitle: {
        fontWeight: 700,
        color: '#1C1C1E',
      },

      sortSelect: {
        minWidth: 200,
        background: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#FDE68A',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#F59E0B',
        },
      },
    }),
    [theme]
  );
};
