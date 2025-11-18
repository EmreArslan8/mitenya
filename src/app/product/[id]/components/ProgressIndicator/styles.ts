import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  progressIndicator: {
    flexDirection: 'row',
    background: '#00000080',
    backdropFilter: 'blur(20px)',
    borderRadius: 99,
    gap: '6px',
    p: 1,
  },
  progressNode: (current = false) => ({
    width: 6,
    height: 6,
    borderRadius: 99,
    background: current ? palette.text.main : palette.text.light,
    transition: 'background 0.2s',
  }),
}));

export default useStyles;
