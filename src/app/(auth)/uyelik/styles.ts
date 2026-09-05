import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  root: {
    position: 'relative',
    minHeight: { md: '100vh' },
    flexDirection: { xs: 'column', md: 'row' },
  },

  /* ── Sol taraf: marka anlatimi + gorsel ── */
  // Mobilde sol sutun yok: ekran dogrudan logo + sekmeler + form.
  aside: {
    display: { xs: 'none', md: 'flex' },
    flex: { md: '1 1 50%' },
    px: { xs: 2.5, sm: 4, md: 6, lg: 8 },
    py: { xs: 4, md: 7 },
    gap: { xs: 2, md: 3 },
    backgroundColor: palette.bg.main,
    // Cok yumusak ortam isigi — duz beyaz yerine derinlik verir.
    backgroundImage:
      'radial-gradient(120% 80% at 0% 0%, rgba(193,18,31,0.05) 0%, rgba(255,255,255,0) 55%)',
  },
  asideTitle: {
    fontWeight: 500,
    fontSize: { xs: 24, sm: 28, lg: 32 },
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: palette.text.main,
  },
  asideBody: {
    fontSize: { xs: 14, sm: 15 },
    lineHeight: 1.8,
    color: palette.text.mediumLight,
    maxWidth: 460,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },
  switchLink: {
    p: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: { xs: 14, sm: 15 },
    color: palette.text.main,
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    transition: 'opacity .2s ease',
    '&:hover': { opacity: 0.6 },
  },

  /* ── Sag taraf: form paneli ── */
  panel: {
    flex: { md: '1 1 50%' },
    backgroundColor: { xs: palette.white.main, md: palette.bg.dark },
    borderLeft: { md: `1px solid ${palette.gray[100]}` },
    px: { xs: 2.5, sm: 4, md: 6, lg: 8 },
    py: { xs: 4, md: 7 },
    alignItems: 'center',
  },
  panelInner: {
    width: '100%',
    maxWidth: 440,
    gap: 3,
    // Sol sutundaki logo yuksekligi kadar bosluk: baslik ile sekmeler ayni hizada dursun.
    mt: { md: 8 },
    // Tema geneli shape.borderRadius 8 — bu sayfada inputlar keskin koseli.
    '& .MuiOutlinedInput-root, & .MuiOutlinedInput-notchedOutline': {
      borderRadius: 0,
    },
    // Gri panel uzerinde inputlar beyaz zeminde daha net okunuyor.
    '& .MuiOutlinedInput-root': {
      backgroundColor: palette.white.main,
      transition: 'border-color .2s ease',
    },
  },
  // Mobilde iki esit sekme + tam genislikte ayirici; masaustunde duz metin.
  mobileLogo: {
    display: { xs: 'flex', md: 'none' },
    alignSelf: 'center',
    mb: 1,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    gap: { xs: 0, md: 4 },
    borderBottom: { xs: `1px solid ${palette.gray[100]}`, md: 'none' },
  },
  tab: (active: boolean) => ({
    transition: 'color .2s ease',
    flex: { xs: 1, md: '0 0 auto' },
    p: 0,
    pb: { xs: 1.5, md: 0 },
    mb: { xs: '-1px', md: 0 },
    border: 'none',
    borderBottom: {
      xs: active ? `2px solid ${palette.text.main}` : '2px solid transparent',
      md: 'none',
    },
    borderRadius: 0,
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: { xs: 17, md: 22 },
    lineHeight: 1.25,
    fontWeight: active ? 600 : 400,
    textAlign: 'center',
    color: active ? palette.text.main : palette.text.mediumLight,
    textDecoration: { xs: 'none', md: active ? 'underline' : 'none' },
    textUnderlineOffset: '8px',
    textDecorationThickness: '1px',
  }),
  stepTitle: {
    fontWeight: 600,
    fontSize: { xs: 20, sm: 22 },
    lineHeight: 1.3,
    color: palette.text.main,
  },
  orderTracking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    pt: 1,
    borderTop: `1px solid ${palette.gray[100]}`,
    mt: 1,
  },
}));

export default useStyles;
