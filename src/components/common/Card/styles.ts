import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(
  (palette) => (border: boolean, stickyHeader: boolean, expanded: boolean) => ({
    card: {
      borderRadius: 1,
      ...(border ? { border: '1px solid', borderColor: palette.tertiary.light } : {}),
    },
    cardHeaderContainer: {
      width: '100%',
      ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 1 } : {}),
    },
    cardHeader: {
      width: '100%',
      top: 0,
      flexDirection: 'row',
      gap: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      textTransform: 'uppercase',
      px: 2,
      py: 1.5,
      borderRadius: '8px 8px 0 0',
    },
    iconAndTitle: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 1 },
    actionArea: { flexDirection: 'row', alignItems: 'center', gap: 1 },
    accordion: {
      '&:before': { display: 'none' },
      borderRadius: 'none !important',
    },
    accordionSummary: {
      display: 'none',
    },
    accordionDetails: (noDivider: boolean) => ({
      p: 0,
      borderTop: !noDivider ? '1px solid' : 'none',
      borderColor: palette.tertiary.light,
    }),
    expandIcon: {
      rotate: expanded ? '180deg' : 0,
      transition: 'rotate 0.15s',
    },
  })
);

export default useStyles;
