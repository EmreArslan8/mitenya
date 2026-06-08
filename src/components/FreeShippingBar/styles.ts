import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: (isFreeShipping: boolean) => ({
    backgroundColor: isFreeShipping ? palette.success.light : palette.bg.dark,
    borderRadius: 2.5,
    padding: 1.75,
    border: '1px solid',
    borderColor: isFreeShipping ? 'rgba(34, 107, 58, 0.22)' : palette.gray[100],
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  }),
  header: {
    marginBottom: 1.25,
    gap: 0.5,
  },
  celebrate: {
    fontSize: 18,
    lineHeight: 1,
  },
  icon: (isFreeShipping: boolean) => ({
    color: isFreeShipping ? palette.success.main : palette.text.mediumLight,
    fontSize: 20,
  }),
  text: (isFreeShipping: boolean) => ({
    fontSize: 13.5,
    fontWeight: isFreeShipping ? 600 : 400,
    letterSpacing: '0.1px',
    color: isFreeShipping ? palette.success.main : palette.text.medium,
    '& strong': {
      fontWeight: 600,
      color: isFreeShipping ? palette.success.main : palette.text.main,
    },
  }),
  thresholdText: {
    fontSize: 11.5,
    color: palette.text.light,
    marginLeft: 3.5,
  },
  progressBar: (isFreeShipping: boolean) => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: isFreeShipping ? 'rgba(34, 107, 58, 0.15)' : palette.gray[100],
    '& .MuiLinearProgress-bar': {
      borderRadius: 3,
      backgroundColor: isFreeShipping ? palette.success.main : palette.primary.main,
      transition: 'transform 0.5s ease-in-out',
    },
  }),
}));

export default useStyles;
