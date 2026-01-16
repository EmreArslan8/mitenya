import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  wrapper: {
    gap: { xs: 1.5, md: 2 },
    width: '100%',
    px: { xs: 1, md: 1.5 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 2,
  },
  headerText: {
    gap: 0.25,
  },
  title: {
    fontSize: { xs: '1.125rem', md: '1.25rem' },
    fontWeight: 700,
    color: palette.text.main,
    lineHeight: 1.3,
  },
  description: {
    fontSize: { xs: '0.875rem', md: '1rem' },
    fontWeight: 500,
    color: palette.text.main,
    lineHeight: 1.4,
  },
  body: {
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 1.5, md: 2 },
    alignItems: 'stretch',
  },
  imageWrapper: {
    position: 'relative',
    width: { xs: '100%', md: '70%' },
    aspectRatio: '3/2',
    borderRadius: 1,
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
  },
  productsContainer: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderWrapper: {
    width: '100%',
    maxWidth: 220,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .slick-slide > div': { boxSizing: 'border-box' },
  },
  sliderCardWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    px: 0.5,
    boxSizing: 'border-box',
  },
}));

export default useStyles;
