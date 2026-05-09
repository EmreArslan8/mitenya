import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  section: {
    gap: 2,
    mt: 0,
    px: { xs: '16px', sm: '32px' },
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 0.8fr) minmax(0, 1.4fr)' },
    gap: { xs: 2, md: 4 },
    alignItems: 'start',
  },
  headingColumn: {
    gap: 1.1,
    pr: { md: 2 },
  },
  title: {
    fontSize: { xs: 24, sm: 36 },
    fontWeight: 500,
    lineHeight: { xs: '28px', sm: '40px' },
  },
  intro: {
    maxWidth: 320,
    fontSize: 13,
    lineHeight: 1.6,
    color: palette.text.secondary,
  },
  contentColumn: {
    gap: 1.4,
  },
  list: {
    gap: 0,
    borderTop: '1px solid',
    borderColor: '#E8E1DF',
  },
  item: {
    overflow: 'hidden',
    borderRadius: '0 !important',
    border: 'none',
    borderBottom: '1px solid',
    borderColor: '#E8E1DF',
    background: 'transparent',
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: 0,
      borderColor: '#DED5D3',
      boxShadow: 'none',
    },
  },
  summary: {
    px: 0,
    py: { xs: 1.5, sm: 1.7 },
    minHeight: 'unset',
    '&.Mui-expanded': {
      minHeight: 'unset',
    },
    '& .MuiAccordionSummary-content': {
      my: 0,
      mr: 1.2,
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      width: 28,
      height: 28,
      color: palette.text.main,
      alignItems: 'center',
      justifyContent: 'center',
    },
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      color: '#B3392B',
    },
  },
  questionWrap: {
    display: 'block',
  },
  question: {
    fontSize: { xs: 17, sm: 18 },
    lineHeight: 1.25,
    fontWeight: 500,
    color: palette.text.main,
  },
  details: {
    px: 0,
    pb: { xs: 1.8, sm: 2 },
    pt: 0,
  },
  answerShell: {
    maxWidth: 720,
    pr: { sm: 3 },
  },
  answer: {
    fontSize: 14,
    lineHeight: 1.75,
    color: palette.text.secondary,
  },
}));

export default useStyles;
