import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  aside: {
    position: 'sticky',
    top: 146,
    left: 0,
    right: 0,
    transition: 'top 0.2s',
    overflowY: 'auto',
    pr: 0.5,
    scrollbarWidth: 'thin',
    scrollbarColor: `${palette.gray[400]} transparent`,
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: palette.gray[400],
      borderRadius: 999,
    },
    gap: 2,
  },
  headerWrap: {
    gap: 1.25,
    pb: 0.75,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: palette.primaryDark.main,
    letterSpacing: '0.01em',
  },
  selectedWrap: {
    gap: 2,
    pt: '8px',
    pb: '40px',
    borderBottom: `2px solid ${palette.gray[100]}`,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: palette.primaryDark.main,
  },
  clearAction: {
    fontSize: 12,
    fontWeight: 600,
    color: palette.primaryDark.main,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'underline',
  },
  selectedChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12px',
    maxHeight: 110,
    overflowY: 'auto',
    pr: 0.5,
    scrollbarWidth: 'thin',
    scrollbarColor: `${palette.gray[400]} transparent`,
    '&::-webkit-scrollbar': {
      width: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: palette.gray[400],
      borderRadius: 999,
    },
  },
  selectedChip: {
    height: 'auto',
    minHeight: 30,
    borderRadius: 999,
    border: `1px solid ${palette.gray[200]}`,
    background: palette.gray[50],
    py: 0.5,
    px: 0.75,
    '& .MuiChip-label': {
      px: 0.75,
      py: 0,
      fontSize: 14,
      fontWeight: 600,
      color: palette.primaryDark.light,
    },
    '& .MuiChip-deleteIcon': {
      width: 16,
      height: 16,
      mr: 0.25,
      ml: 0.25,
      color: palette.primaryDark.light,
    },
  },
}));

export default useStyles;
