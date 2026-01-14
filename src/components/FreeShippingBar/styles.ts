import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: (isFreeShipping: boolean) => ({
    backgroundColor: isFreeShipping ? palette.success.light : palette.warning.light,
    borderRadius: 2,
    padding: 2,
    border: '1px solid',
    borderColor: isFreeShipping ? palette.success.main : palette.warning.dark,
  }),
  header: {
    marginBottom: 1,
    gap: 0.5,
  },
  icon: (isFreeShipping: boolean) => ({
    color: isFreeShipping ? palette.success.main : palette.warning.dark,
    fontSize: 24,
  }),
  text: (isFreeShipping: boolean) => ({
    fontSize: 14,
    color: palette.secondary.main,
    '& strong': {
      color: isFreeShipping ? palette.success.main : palette.warning.dark,
    },
  }),
  thresholdText: {
    fontSize: 12,
    color: palette.tertiary.main,
    marginLeft: 4,
  },
  progressBar: (isFreeShipping: boolean) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: isFreeShipping ? palette.success.light : palette.tertiary.light,
    '& .MuiLinearProgress-bar': {
      borderRadius: 4,
      backgroundColor: isFreeShipping ? palette.success.main : palette.warning.dark,
      transition: 'transform 0.4s ease-in-out',
    },
  }),
}));

export default useStyles;
