import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: (variant: 'horizontal' | 'vertical' | 'grid') => ({
    flexDirection: variant === 'vertical' ? 'column' : 'row',
    flexWrap: variant === 'grid' ? 'wrap' : 'nowrap',
    gap: variant === 'vertical' ? 1.5 : variant === 'horizontal' ? 3 : 2,
    justifyContent: variant === 'horizontal' ? 'space-around' : 'flex-start',
    alignItems: variant === 'horizontal' ? 'flex-start' : 'stretch',
    padding: variant === 'horizontal' ? 3 : 2,
    backgroundColor: palette.info.light,
    borderRadius: 2,
    border: '1px solid',
    borderColor: palette.info.main + '30',
  }),
  badge: (variant: 'horizontal' | 'vertical' | 'grid') => ({
    flexDirection: variant === 'vertical' ? 'row' : 'column',
    alignItems: 'center',
    gap: 1,
    flex: variant === 'grid' ? '1 1 45%' : variant === 'horizontal' ? 1 : 'unset',
    textAlign: variant === 'horizontal' ? 'center' : 'left',
  }),
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: palette.bg.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(74, 135, 227, 0.15)',
  },
  icon: {
    color: palette.info.main,
    fontSize: 26,
  },
  textWrapper: {
    gap: 0.25,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: palette.secondary.main,
    lineHeight: 1.3,
  },
  description: {
    fontSize: 11,
    color: palette.tertiary.main,
    lineHeight: 1.3,
  },
}));

export default useStyles;
