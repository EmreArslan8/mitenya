import { SxProps } from '@mui/material';
import { withPalette } from '@/theme/ThemeRegistry';

export const AUTOPLAY_DELAY = 10000;

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: { xs: '100vw', sm: '100%' },
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    pb: 3,
  },

  // Noktalar yerine segment cubuklari: hangisindeyiz + ne zaman degisecek.
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    // Dokunma kutusu 24px oldugu icin cizgi kutunun ortasinda duruyor;
    // cizginin gorsele uzakligi eskisiyle ayni kalsin diye kutu asagi cekildi.
    // Tasan kisim yalnizca bos padding, kirpilmasi sorun degil.
    bottom: -2,
    left: 0,
    right: 0,
    zIndex: 2,
    gap: '10px',
  } as SxProps,

  progressTrack: (active: boolean): SxProps => ({
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 'none',
    // Dokunma hedefi 24px, cizgi 2px: gorsel incelik erisilebilirligi bozmasin.
    padding: '11px 0',
    background: 'none',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: active ? 44 : 18,
    transition: 'width .45s cubic-bezier(.22,.61,.36,1)',
    '&::before': {
      content: '""',
      display: 'block',
      width: '100%',
      height: 2,
      borderRadius: 999,
      backgroundColor: palette.gray[300],
      transition: 'background-color .3s ease',
    },
    '&:hover::before': { backgroundColor: palette.gray[500] },
  }),

  progressFill: (active: boolean, paused: boolean): SxProps => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: '-1px',
    height: 2,
    borderRadius: 999,
    transformOrigin: 'left center',
    backgroundColor: palette.text.main,
    // Aktif cubuk otoplay suresince soldan saga doluyor.
    animation: active ? `bannerProgress ${AUTOPLAY_DELAY}ms linear forwards` : 'none',
    animationPlayState: paused ? 'paused' : 'running',
    transform: active ? undefined : 'scaleX(0)',
    '@keyframes bannerProgress': {
      from: { transform: 'scaleX(0)' },
      to: { transform: 'scaleX(1)' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: active ? 'scaleX(1)' : 'scaleX(0)',
    },
  }),

  arrowBase: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 30,
    height: 52,
    // Kutu yok: ciplak chevron. Masaustunde her zaman gorunur.
    background: 'none',
    borderRadius: 0,
    color: '#FFFFFF',
    // Beyaz ok acik tonlu banner'larda kaybolmasin diye hafif golge.
    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
    display: { xs: 'none', sm: 'flex' },
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
    transition: 'opacity .15s ease',
    '&:hover, &:focus-visible': { opacity: 1, background: 'none' },
  } as SxProps,

  prevButton: { left: 14 } as SxProps,
  nextButton: { right: 14 } as SxProps,
}));

export default useStyles;
