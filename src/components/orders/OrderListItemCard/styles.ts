import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  card: {
    p: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '12px',
    border: `1px solid ${palette.gray[100]}`,
    bgcolor: palette.white.main,
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    '&:hover': {
      borderColor: palette.gray[200],
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      transform: 'translateY(-1px)',
      '& .order-arrow': {
        transform: 'translateX(3px)',
        color: palette.text.main,
      },
    },
  },
  statusIndicator: {
    width: 4,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    p: { xs: 2, sm: 2.5 },
    width: '100%',
  },
  infoSection: {
    flex: 1,
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'flex-start', sm: 'center' },
    gap: { xs: 2, sm: 3.5 },
    minWidth: 0,
  },
  orderIdSection: {
    gap: 0.25,
    minWidth: 0,
  },
  orderIdLabel: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0,
    color: palette.text.medium,
    lineHeight: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 700,
    color: palette.text.main,
    lineHeight: 1.3,
  },
  dateText: {
    fontSize: 13,
    fontWeight: 500,
    color: palette.text.mediumLight,
    lineHeight: 1,
    whiteSpace: 'nowrap' as const,
  },
  statusChip: {
    height: 28,
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    color: palette.text.disabled,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
  },
}));

export default useStyles;
