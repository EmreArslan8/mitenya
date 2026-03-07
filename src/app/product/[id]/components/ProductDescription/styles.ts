import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    gap: 0,
    borderTop: `1px solid ${palette.gray?.[200] ?? palette.bg.light}`,
  },
  accordion: {
    boxShadow: 'none',
    border: 'none',
    borderBottom: `1px solid ${palette.gray?.[200] ?? palette.bg.light}`,
    borderRadius: '0 !important',
    backgroundColor: 'transparent',
    '&:before': { display: 'none' },
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  summary: {
    minHeight: 'unset',
    px: '8px',
    py: '14px',
    '&.Mui-expanded': {
      minHeight: 'unset',
    },
    '& .MuiAccordionSummary-content': {
      margin: 0,
      mr: '16px',
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      color: palette.text.main,
      width: 28,
      height: 28,
    },
  },
  title: {
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: 1.45,
    color: palette.text.main,
  },
  details: {
    px: '14px',
    pt: 0,
    pb: '16px',
  },
  markdown: {
    color: palette.text.main,
  },
}));

export default useStyles;
