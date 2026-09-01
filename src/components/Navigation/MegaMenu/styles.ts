import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  panel: {
    display: { xs: 'none', sm: 'block' },
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 2000,
    px: 4,
    py: 4.5,
    backgroundColor: palette.bg.main,
    borderTop: `1px solid ${palette.gray[100] ?? palette.gray[200]}`,
    boxShadow: '0 18px 32px rgba(15, 20, 32, 0.10)',
    animation: 'megaMenuIn .18s ease-out both',
    '@keyframes megaMenuIn': {
      from: { opacity: 0, transform: 'translate3d(0, -4px, 0)' },
      to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    },
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  inner: {
    display: 'grid',
    gap: 6,
    alignItems: 'start',
    maxWidth: defaultMaxWidth,
    mx: 'auto',
  },
  innerWithFeature: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 320px',
    gap: 6,
    alignItems: 'start',
    maxWidth: defaultMaxWidth,
    mx: 'auto',
  },
  columns: {
    display: 'grid',
    // En fazla dort sutun: fazlasi taranamiyor, listeye donuyor.
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    columnGap: 5,
  },
  group: {
    gap: 0,
  },
  groupTitle: {
    mb: 1.5,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: palette.text.main,
    cursor: 'pointer',
  },
  link: {
    fontSize: 14.5,
    lineHeight: 2,
    color: palette.text.mediumLight,
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'color .15s ease',
    // Hover'da renk degistirmek yerine koyulastir: daha sakin.
    '&:hover': { color: palette.text.main, textDecoration: 'underline' },
  },
  allLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0.75,
    mt: 1.5,
    cursor: 'pointer',
    color: palette.text.main,
    width: 'fit-content',
    '&:hover': { textDecoration: 'underline' },
  },
  allLinkText: {
    fontSize: 13.5,
    fontWeight: 600,
  },
  feature: {
    gap: 1.25,
    cursor: 'pointer',
    '&:hover img': { transform: 'scale(1.03)' },
    '@media (prefers-reduced-motion: reduce)': { '&:hover img': { transform: 'none' } },
  },
  featureFrame: {
    position: 'relative',
    width: '100%',
    // Vitrin, link sutunlarindan uzun olmamali.
    aspectRatio: '4 / 3',
    maxHeight: 200,
    overflow: 'hidden',
    backgroundColor: palette.gray[50] ?? palette.bg.light,
    '& img': { transition: 'transform .45s ease' },
  },
  featureCaption: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.main,
  },

  // tiles — ihtiyac ekseni: link yerine gorsel kadraj
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 2,
    maxWidth: defaultMaxWidth,
    mx: 'auto',
  },
  tile: {
    gap: 1.25,
    cursor: 'pointer',
    '&:hover img': { transform: 'scale(1.04)' },
    '@media (prefers-reduced-motion: reduce)': { '&:hover img': { transform: 'none' } },
  },
  tileFrame: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    maxHeight: 180,
    overflow: 'hidden',
    backgroundColor: palette.gray[50] ?? palette.bg.light,
    '& img': { transition: 'transform .45s ease' },
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.main,
  },

  // cards — rutinler: iki genis kart, metin gorselin yaninda
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 4,
    maxWidth: defaultMaxWidth,
    mx: 'auto',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    cursor: 'pointer',
    '&:hover img': { transform: 'scale(1.04)' },
    '@media (prefers-reduced-motion: reduce)': { '&:hover img': { transform: 'none' } },
  },
  cardFrame: {
    position: 'relative',
    width: 180,
    height: 135,
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: palette.gray[50] ?? palette.bg.light,
    '& img': { transition: 'transform .45s ease' },
  },
  cardText: {
    gap: 0.5,
    minWidth: 0,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: palette.text.mediumLight,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: palette.text.main,
  },
  cardDescription: {
    fontSize: 13.5,
    lineHeight: 1.5,
    color: palette.text.mediumLight,
  },
}));

export default useStyles;
