import { SxProps } from '@mui/material';

export const modalStyles = {
  modalCard: {
    width: { xs: 'calc(100vw - 8px)', sm: 'min(92vw, 820px)' },
    maxWidth: 'calc(100vw - 8px)',
    maxHeight: { xs: 'calc(100dvh - 8px)', sm: 'calc(100dvh - 32px)' },
    borderRadius: { xs: '14px 14px 0 0', sm: '14px' },
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 28px 90px rgba(40, 30, 20, 0.22)',
    boxSizing: 'border-box',
  } as SxProps,

  modalBody: { p: 0 } as SxProps,

  modalContent: {
    position: 'relative',
    maxWidth: '100%',
    overflow: 'hidden',
    minHeight: 0,
  } as SxProps,

  closeButton: {
    position: 'absolute',
    top: { xs: 8, md: 12 },
    right: { xs: 8, md: 12 },
    zIndex: 2,
    color: '#111111',
    width: { xs: 36, md: 36 },
    height: { xs: 36, md: 36 },
    '&:hover': { backgroundColor: 'transparent' },
  } as SxProps,

  visualPanel: {
    position: 'relative',
    flex: { xs: '0 0 auto', md: '0 0 44%' },
    minHeight: { xs: 124, sm: 240, md: 520 },
    aspectRatio: { xs: '2.05 / 1', sm: 'auto' },
    overflow: 'hidden',
    backgroundImage: {
      xs: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 100%), url("/static/images/mobile-modal.webp")',
      md: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 100%), url("/static/images/modal.webp")',
    },
    backgroundSize: 'cover',
    backgroundPosition: { xs: 'center 24%', md: '42% center' },
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#d8d0c9',
  } as SxProps,

  visualOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at 24% 18%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 28%), radial-gradient(circle at 76% 28%, rgba(255,245,228,0.12) 0%, rgba(255,245,228,0) 22%)',
  } as SxProps,

  contentColumn: {
    flex: 1,
    minWidth: 0,
    px: { xs: 1.25, sm: 3, md: 3.25 },
    py: { xs: 1.25, sm: 2.75, md: 2.8 },
    justifyContent: 'center',
    gap: { xs: 1, md: 1.5 },
    background: '#fff',
  } as SxProps,

  heroContent: {
    alignItems: 'flex-start',
    textAlign: 'left',
    gap: { xs: 0.75, md: 1.5 },
    mt: { xs: 0.9, md: 3 },
  } as SxProps,

  title: {
    fontSize: { xs: '23px', sm: '30px', md: '34px' },
    lineHeight: { xs: '28px', sm: '34px', md: '38px' },
    letterSpacing: '-0.05em',
    color: '#2d3340',
    fontWeight: 700,
    maxWidth: 330,
    mb: 0.25,
    '& br': {
      display: { xs: 'none', sm: 'block' },
    },
  } as SxProps,

  subtitle: {
    fontSize: { xs: '13px', sm: '17px', md: '18px' },
    lineHeight: { xs: '18px', sm: '23px', md: '24px' },
    color: 'rgba(35,49,66,0.84)',
    fontWeight: 400,
    maxWidth: 390,
  } as SxProps,

  couponCard: {
    width: '100%',
    p: { xs: 1.1, sm: 1.75 },
    pr: { xs: 5.5, sm: 7 },
    borderRadius: '8px',
    border: '1px solid rgba(35,49,66,0.14)',
    bgcolor: '#f8fafc',
    position: 'relative',
    mt: { xs: 0.5, md: 0.75 },
  } as SxProps,

  couponLabel: {
    fontSize: { xs: 11, sm: 12 },
    color: 'rgba(35,49,66,0.56)',
    mb: { xs: 0.5, sm: 0.75 },
    textAlign: 'left',
  } as SxProps,

  couponCode: {
    fontSize: { xs: 15, sm: 22, md: 24 },
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: { xs: '0.1em', sm: '0.16em' },
    color: '#233142',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  } as SxProps,

  copyButton: {
    position: 'absolute',
    right: { xs: 8, sm: 12 },
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#233142',
    width: { xs: 28, sm: 32 },
    height: { xs: 28, sm: 32 },
    p: 0,
    '&:hover': { backgroundColor: 'rgba(35,49,66,0.08)' },
  } as SxProps,

  actions: {
    gap: { xs: 0.6, md: 1 },
    mt: { xs: 0.75, md: 2 },
  } as SxProps,

  primaryButton: {
    minHeight: { xs: 42, sm: 54 },
    borderRadius: { xs: '12px', sm: '14px' },
    background: '#111111',
    color: '#ffffff',
    boxShadow: 'none',
    fontSize: { xs: 12, sm: 14 },
    '&:hover': { background: '#000000' },
  } as SxProps,

  footerText: {
    fontSize: { xs: 10.5, sm: 12 },
    lineHeight: { xs: 1.4, sm: 1.55 },
    color: 'rgba(79,88,99,0.84)',
    textAlign: 'left',
    maxWidth: '100%',
    alignSelf: 'stretch',
    pt: { xs: 0.75, sm: 1.5 },
    mt: 0,
    borderTop: '1px solid rgba(17,17,17,0.08)',
  } as SxProps,

  snackbar: {
    px: 2,
    py: 1.25,
    borderRadius: 2,
    bgcolor: '#1b5e20',
    color: '#fff',
    boxShadow: 3,
  } as SxProps,
};

export const useLauncherStyles = (isMobile: boolean) => ({
  launcher: {
    position: 'fixed',
    right: 'auto',
    left: isMobile ? 8 : 0,
    bottom: isMobile ? 18 : '44%',
    transform: isMobile ? 'none' : 'translateY(50%)',
    zIndex: 1301,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: isMobile ? 'rgba(58,58,60,0.12)' : '#111111',
    outline: 'none',
    borderRadius: isMobile ? '999px' : 0,
    background: isMobile ? '#3A3A3C' : '#111111',
    color: '#fff',
    boxShadow: isMobile ? '0 12px 28px rgba(17, 17, 17, 0.18)' : '0 14px 28px rgba(0, 0, 0, 0.22)',
    px: isMobile ? 1.4 : 1,
    py: isMobile ? 0.9 : 1.2,
    minWidth: isMobile ? 'auto' : 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? 0.6 : 1,
    transition: 'transform 160ms ease, box-shadow 160ms ease',
    whiteSpace: 'nowrap',
    writingMode: isMobile ? 'horizontal-tb' : 'vertical-rl',
    textOrientation: 'mixed',
    '&:hover': {
      transform: isMobile ? 'translateY(-2px)' : 'translateY(50%) translateX(2px)',
      boxShadow: isMobile ? '0 16px 34px rgba(17, 17, 17, 0.22)' : '0 18px 32px rgba(0, 0, 0, 0.28)',
    },
    '&:focus-visible': {
      boxShadow: isMobile
        ? '0 0 0 3px #FFFFFF, 0 0 0 5px #3A3A3C'
        : '0 0 0 3px rgba(255, 220, 166, 0.95), 0 18px 40px rgba(18, 12, 7, 0.34)',
    },
  } as SxProps,

  stack: {
    alignItems: 'center',
    gap: isMobile ? 0.75 : 0.65,
    flexDirection: isMobile ? 'row' : 'column',
  } as SxProps,

  percent: {
    fontSize: isMobile ? 16 : 11,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: isMobile ? 0 : '0.08em',
  } as SxProps,

  label: {
    fontSize: isMobile ? 16 : 10,
    fontWeight: 700,
    lineHeight: 1,
    textTransform: isMobile ? 'none' : 'uppercase',
    letterSpacing: isMobile ? 0 : '0.08em',
  } as SxProps,

  trigger: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 0,
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    p: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  } as SxProps,

  dismiss: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 0,
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    p: isMobile ? 0.25 : 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? 20 : 'auto',
    height: isMobile ? 20 : 'auto',
    opacity: 0.9,
    '&:hover': { opacity: 1 },
  } as SxProps,
});
