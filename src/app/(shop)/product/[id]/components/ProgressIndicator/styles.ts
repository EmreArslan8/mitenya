import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    px: 0.5,
    py: 0.5,
  },
  progressNode: (current = false) => ({
    width: current ? 28 : 8,
    height: 8,
    borderRadius: 99,
    background: current ? '#111111' : '#D8D2CC',
    transition: 'width 0.2s ease, background-color 0.2s ease',
  }),
}));

export default useStyles;
