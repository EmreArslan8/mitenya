import { SxProps } from '@mui/material';
import { BannerVariant } from '.';
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(
  (palette) =>
    (
      variant: BannerVariant,
      horizontal: boolean,
      withWhiteBg: boolean,
      border: boolean
    ): { [key: string]: SxProps } => ({
      banner: {
        p: 1,
        borderRadius: 1,
        border: border ? 1 : 'none',
        borderColor: (palette as any)[variant]?.main,
        backgroundColor: withWhiteBg ? '#fff' : (palette as any)[variant]?.light,
        gap: 2,
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: horizontal ? 'center' : 'start',
        height: 'fit-content',
      },
      header: {
        color: (palette as any)[variant]?.main,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
      },
      button: {
        width: horizontal ? 'max-content' : '100%',
        alignSelf: 'center',
        mt: horizontal ? 0 : 2,
        flexShrink: 0,
      },
      accordion: {
        '&::before': { display: 'none' },
        background: 'transparent',
        width: '100%',
      },
      accordionSummary: {
        px: 0,
        minHeight: 0,
        '& .MuiAccordionSummary-content': {
          alignItems: 'center',
          gap: 2,
          m: 0,
        },
      },
      accordionDetails: {
        p: 0,
        display: 'flex',
        flexDirection: 'column',
      },
      icon: {
        color: (palette as any)[variant]?.main,
      },
    })
);

export default useStyles;
