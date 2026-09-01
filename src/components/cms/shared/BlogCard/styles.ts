const styles = {
  card: (featured: boolean) => ({
    position: 'relative',
    isolation: 'isolate',
    height: '100%',
    p: featured ? { xs: 1, md: 1.25 } : 1,
    borderRadius: 0,
    overflow: 'hidden',
    bgcolor: 'rgba(255, 255, 255, 0.68)',
    backgroundImage: `
      radial-gradient(circle at 100% 0%, rgba(193, 18, 31, 0.07), transparent 34%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.46))
    `,
    backdropFilter: 'blur(18px) saturate(145%)',
    WebkitBackdropFilter: 'blur(18px) saturate(145%)',
    border: '1px solid rgba(255, 255, 255, 0.88)',
    boxShadow: '0 10px 34px rgba(28, 28, 30, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.88)',
    transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, background-color 0.4s ease, border-color 0.4s ease',
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: -1,
      width: featured ? 180 : 120,
      height: featured ? 180 : 120,
      right: -50,
      bottom: -70,
      borderRadius: '50%',
      bgcolor: 'rgba(193, 18, 31, 0.055)',
      filter: 'blur(10px)',
      opacity: 0.65,
      transition: 'opacity 0.4s ease, transform 0.5s ease',
    },
    '&:hover': {
      transform: { xs: 'none', md: 'translateY(-7px)' },
      bgcolor: 'rgba(255, 255, 255, 0.78)',
      borderColor: 'rgba(193, 18, 31, 0.24)',
      boxShadow: { xs: '0 10px 34px rgba(28, 28, 30, 0.07)', md: '0 22px 52px rgba(28, 28, 30, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.96)' },
      '& .blog-image': {
        transform: 'scale(1.045)',
      },
      '& .blog-arrow': {
        transform: 'translateX(4px)',
        bgcolor: '#C1121F',
        color: '#fff',
      },
      '&::after': {
        opacity: 1,
        transform: 'scale(1.25)',
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': {
        transform: 'none',
        '& .blog-image, & .blog-arrow, &::after': {
          transform: 'none',
        },
      },
    },
  }),
  imageWrapper: (featured: boolean) => ({
    position: 'relative',
    overflow: 'hidden',
    width: featured
      ? { xs: '100%', md: '55%' }
      : { xs: 110, md: '100%' },
    minWidth: featured
      ? { xs: '100%', md: '55%' }
      : { xs: 110, md: 'auto' },
    minHeight: featured
      ? { xs: 200, md: 320 }
      : { xs: 106, md: 0 },
    aspectRatio: featured
      ? { xs: '16/9', md: 'auto' }
      : { xs: '1/1', md: '16/10' },
    borderRadius: 0,
    bgcolor: 'rgba(242, 242, 247, 0.82)',
    boxShadow: '0 4px 18px rgba(28, 28, 30, 0.08)',
  }),
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  imageFallback: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bgcolor: 'rgba(242, 242, 247, 0.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: '#AEAEB2',
    fontSize: 40,
    fontWeight: 700,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    bgcolor: 'rgba(255, 255, 255, 0.72)',
    color: '#2C2C2E',
    fontSize: 10,
    fontWeight: 700,
    px: 1.4,
    py: 0.65,
    borderRadius: 99,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 4px 14px rgba(28, 28, 30, 0.1)',
    zIndex: 1,
  },
  content: (featured: boolean) => ({
    p: featured ? { xs: 2, md: 4 } : { xs: 1.25, md: 2.25 },
    gap: featured ? 1.75 : { xs: 0.55, md: 1.35 },
    flex: 1,
    justifyContent: featured ? 'center' : 'flex-start',
  }),
  dateText: (featured: boolean) => ({
    color: '#7C7C80',
    fontSize: { xs: 11, md: featured ? 13 : 12 },
    fontWeight: 600,
    letterSpacing: '0.01em',
  }),
  title: (featured: boolean) => ({
    fontWeight: 750,
    fontSize: featured
      ? { xs: 18, md: 24 }
      : { xs: 14, md: 16 },
    lineHeight: 1.28,
    letterSpacing: '-0.025em',
    color: '#202022',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: featured ? 3 : 2,
    WebkitBoxOrient: 'vertical',
  }),
  excerpt: (featured: boolean) => ({
    display: featured ? '-webkit-box' : { xs: 'none', md: '-webkit-box' },
    color: '#626267',
    fontSize: featured ? { xs: 13, md: 15 } : 13,
    lineHeight: 1.6,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: featured ? 3 : 2,
    WebkitBoxOrient: 'vertical',
  }),
  readMore: (featured: boolean) => ({
    display: { xs: 'none', md: 'flex' },
    mt: featured ? 1 : 'auto',
    pt: featured ? 0 : 1,
  }),
  readMoreText: {
    fontSize: 13,
    fontWeight: 700,
    color: '#353538',
  },
  readMoreArrow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    ml: 0.25,
    borderRadius: '50%',
    bgcolor: 'rgba(193, 18, 31, 0.08)',
    transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s ease, color 0.3s ease',
    color: '#C1121F',
  },
};

export default styles;
