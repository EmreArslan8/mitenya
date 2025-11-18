import { withPalette } from '@/theme/ThemeRegistry';

const digitBoxWidth = {
  small: 32,
  medium: 46,
  large: 56,
};

const GAP = 8;

const useStyles = withPalette((palette) => ({
  otpContainer: (size: 'small' | 'medium' | 'large', length: number) => ({
    position: 'relative',
    width: digitBoxWidth[size] * length + GAP * (length - 1),
  }),
  otpInput: (size: 'small' | 'medium' | 'large') => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: size === 'small' ? '32px' : size === 'medium' ? '46px' : '56px',
    opacity: 0,
    zIndex: 2,
    '& input': {
      textAlign: 'center',
      letterSpacing: '1em',
      caretColor: 'transparent',
    },
  }),  
  digitOverlay: (size: 'small' | 'medium' | 'large') => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    height: size === 'small' ? '32px' : size === 'medium' ? '46px' : '56px', 
    position: 'relative',
    pointerEvents: 'none',
    gap: 1,
  }),
  digitBox: (size: 'small' | 'medium' | 'large') => ({
    flex: 1,
    margin: '0 4px',
    height: size === 'small' ? '32px' : size === 'medium' ? '46px' : '56px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: `2px solid ${palette.text.light}`,
    borderRadius: '8px',
    width: digitBoxWidth[size],
    fontSize: size === 'small' ? '16px' : size === 'medium' ? '20px' : '24px',
    color: palette.text.main,
    backgroundColor: palette.bg.main,
    cursor: 'pointer',
    transition: 'border-color 0.3s',
    '&:focus': {
      outline: `2px solid ${palette.primary.main}`,
    },
  }),
}));

export default useStyles;
