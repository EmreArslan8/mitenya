const styles = {
  card: (featured: boolean) => ({
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    bgcolor: '#fff',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid',
    borderColor: '#E5E5EA',
    '&:hover': {
      transform: { xs: 'none', md: 'translateY(-6px)' },
      boxShadow: { xs: 'none', md: '0 16px 40px rgba(0,0,0,0.08)' },
      borderColor: '#D1D1D6',
      '& .blog-image': {
        transform: 'scale(1.06)',
      },
      '& .blog-arrow': {
        transform: 'translateX(4px)',
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
      : { xs: 110, md: 0 },
    aspectRatio: featured
      ? { xs: '16/9', md: 'auto' }
      : { xs: '1/1', md: '16/10' },
    bgcolor: '#F5F5F7',
  }),
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  imageFallback: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bgcolor: '#F5F5F7',
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
    bgcolor: '#fff',
    color: '#1C1C1E',
    fontSize: 11,
    fontWeight: 700,
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    zIndex: 1,
  },
  content: (featured: boolean) => ({
    p: featured ? { xs: 2.5, md: 4 } : { xs: 1.5, md: 2.5 },
    gap: featured ? 2 : { xs: 0.5, md: 1.5 },
    flex: 1,
    justifyContent: featured ? 'center' : 'flex-start',
  }),
  dateText: (featured: boolean) => ({
    color: '#8E8E93',
    fontSize: { xs: 11, md: featured ? 13 : 12 },
    fontWeight: 500,
  }),
  title: (featured: boolean) => ({
    fontWeight: 700,
    fontSize: featured
      ? { xs: 18, md: 24 }
      : { xs: 14, md: 16 },
    lineHeight: 1.3,
    color: '#1C1C1E',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: featured ? 3 : 2,
    WebkitBoxOrient: 'vertical',
  }),
  excerpt: (featured: boolean) => ({
    display: featured ? '-webkit-box' : { xs: 'none', md: '-webkit-box' },
    color: '#6E6E73',
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
    fontWeight: 600,
    color: '#3A3A3C',
  },
  readMoreArrow: {
    display: 'inline-flex',
    transition: 'all 0.3s ease',
    color: '#6E6E73',
  },
};

export default styles;
