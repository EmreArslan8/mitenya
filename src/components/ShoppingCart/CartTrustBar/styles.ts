import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  /*
   * Şerit header'ın hemen altında, sayfa genişliğinin tamamını kaplar.
   * MainLayout içeriği maxWidth ile ortalandığı için tam genişliğe
   * negatif kenar boşluğuyla taşıyoruz.
   */
  bleed: {
    width: '100vw',
    maxWidth: '100vw',
    ml: 'calc(50% - 50vw)',
    mr: 'calc(50% - 50vw)',
    backgroundColor: palette.accentRed.light,
  },
  inner: {
    width: '100%',
    maxWidth: defaultMaxWidth,
    alignSelf: 'center',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'center',
    justifyContent: 'center',
    gap: { xs: '8px', md: 0 },
    px: 2,
    py: '10px',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    px: { xs: 0, md: 3 },
    minWidth: 0,
    color: palette.accentRed.main,
    /* Maddeler arası ince ayraç */
    '& + &': {
      /* Ayraç, gri yerine zeminin kendi kırmızısının soluk hali. */
      borderLeft: { xs: 'none', md: '1px solid rgba(193, 18, 31, 0.18)' },
    },
  },
  text: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: '18px',
    letterSpacing: '0.24px',
    color: palette.text.main,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export default useStyles;
