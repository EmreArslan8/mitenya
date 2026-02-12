import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  card: {
    p: 0,
    borderRadius: '12px',
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
    borderRadius: '0 2px 2px 0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2.5,
    p: { xs: 2.25, sm: 2.75 },
    width: '100%',
  },
  infoGrid: {
    flex: 1,
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: '220px 220px minmax(220px, 1fr) 170px',
    },
    gap: { xs: 1.75, sm: 2, lg: 2.5 },
  },
  orderIdLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.2,
    color: palette.text.medium,
    lineHeight: 1.2,
  },
  orderId: {
    fontSize: 17,
    fontWeight: 700,
    color: palette.text.main,
    lineHeight: 1.3,
    whiteSpace: 'nowrap' as const,
    wordBreak: 'keep-all',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.2,
    color: palette.text.medium,
    lineHeight: 1.2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 500,
    color: palette.text.mediumLight,
    lineHeight: 1.35,
  },
  metaValueEllipsis: {
    fontSize: 14,
    fontWeight: 500,
    color: palette.text.mediumLight,
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: palette.text.main,
    lineHeight: 1.3,
  },
  statusChip: {
    height: 30,
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    minWidth: 140,
  },
  actionArea: {
    minWidth: 170,
    justifyContent: 'flex-end',
    flexShrink: 0,
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
