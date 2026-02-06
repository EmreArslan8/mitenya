import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    gap: 1,
  },
  accordion: {
    boxShadow: 'none',
    border: `1px solid ${palette.bg.light}`,
    borderRadius: '8px !important',
    '&:before': { display: 'none' },
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  summary: {
    minHeight: 48,
    px: 2,
    '&.Mui-expanded': {
      minHeight: 48,
      borderBottom: `1px solid ${palette.bg.light}`,
    },
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
    },
  },
  title: {
    fontWeight: 600,
    fontSize: 15,
    color: palette.text.main,
  },
  details: {
    px: 2,
    py: 2,
  },
}));

export default useStyles;
