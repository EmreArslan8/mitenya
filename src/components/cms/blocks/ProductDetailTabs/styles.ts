import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  section: {
    mt: { xs: 3, md: 5 },
    px: { xs: '16px', sm: '32px' },
    py: { xs: 2, sm: 3, md: 4 },
    maxWidth: '100%',
  },
  sectionHeaderTypography: {
    m: 0,
    fontSize: { xs: 24, sm: 36 },
    lineHeight: { xs: '28px', sm: '40px' },
    fontWeight: 500,
    color: '#0B0B0D',
  },
  sectionButton: {
    color: 'gray.900',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    px: 1.25,
    py: 0.75,
    minHeight: 28,
    borderRadius: 1,
    borderColor: 'gray.300',
    backgroundColor: 'common.white',
    letterSpacing: '0.02em',
    '&:hover': {
      borderColor: 'gray.400',
      backgroundColor: 'gray.50',
    },
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 520px' },
    gap: { xs: 3, md: 5 },
    alignItems: 'center',
  },
  content: {
    minWidth: 0,
    alignSelf: 'stretch',
    justifyContent: 'start',
  },
  imageWrap: {
    minWidth: 0,
    alignSelf: 'stretch',
    display: { xs: 'none', md: 'block' },
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 5',
    overflow: 'hidden',
    borderRadius: 0,
    background: '#EBEBE8',
  },
  image: {
    objectFit: 'cover',
  },
  tabItem: {
    background: 'transparent',
    boxShadow: 'none',
    borderBottom: '1px solid #E2E2E2',
    '&:first-of-type': {
      borderTop: '1px solid #E2E2E2',
    },
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: 0,
    },
    '&:last-of-type': {
      borderBottom: 'none',
    },
  },
  header: {
    py: { xs: 2.25, md: 2.6 },
    px: 0,
    minHeight: 'unset',
    '&.Mui-expanded': {
      minHeight: 'unset',
    },
    '& .MuiAccordionSummary-content': {
      my: 0,
      mr: 2,
    },
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.35,
    color: '#212121',
    transition: 'transform 0.2s ease',
  },
  details: {
    px: 0,
    pb: { xs: 2.25, md: 2.6 },
    pt: 0,
  },
  description: {
    maxWidth: 620,
    '& p': {
      color: '#838687',
      fontSize: { xs: 13.5, md: 15 },
      lineHeight: 1.62,
      mb: 0,
    },
  },
  icon: {
    color: '#838687',
    transition: 'transform 0.3s ease',
  },
}));

export default useStyles;
