export const defaultPalette = {
  logo: { src: '/static/images/logo.svg', width: 125, height: 40 },

  /**
   * PRIMARY = Ana aksiyon rengi (CTA / Sepete Ekle / Satın Al)
   * Siyah / koyu nötr
   */
  primary: {
    main: '#111111',              // Black-ish primary
    light: '#2C2C2E',
    dark: '#000000',
    deepDark: '#000000',
    contrastText: '#FFFFFF',
    gradient: 'linear-gradient(180deg, #000000 0%, #1C1C1E 100%)',
  },

  /**
   * PRIMARY DARK = Daha yoğun koyu varyant (header, footer, bazı arka planlar)
   */
  primaryDark: {
    main: '#1C1C1E',
    light: '#2C2C2E',
    dark: '#0B0B0D',
    contrastText: '#FFFFFF',
    gradient: 'linear-gradient(180deg, #0B0B0D 0%, #1C1C1E 100%)',
  },

  /* 🧱 BACKGROUND SYSTEM */
  bg: {
    main: '#FFFFFF',
    dark: '#F5F5F7',
    light: '#FAFAFA',
    contrastText: '#1C1C1E',
  },

  /* 🔵 INFO / LINK / OPTIONAL ACCENT (Blue) */
  blue: {
    main: '#4A87E3',
    dark: '#1754B0',
    light: '#F5F9FF',
    contrastText: '#FFFFFF',
    gradient:
      'linear-gradient(102.11deg, #00327D 2.24%, #1754B0 50.27%, #78A3E3 98.95%)',
  },

  info: {
    main: '#4A87E3',
    dark: '#1754B0',
    light: '#F5F9FF',
    contrastText: '#FFFFFF',
    gradient:
      'linear-gradient(102.11deg, #00327D 2.24%, #1754B0 50.27%, #78A3E3 98.95%)',
  },

  green: {
    main: '#6B705C',
    dark: '#4A4E42',
    light: '#EEF0EB',
    contrastText: '#FFFFFF',
    gradient: 'linear-gradient(102.11deg, #4A4E42 2.24%, #6B705C 98.95%)',
  },

  success: {
    main: '#226B3A',
    dark: '#4A4E42',
    light: '#EEF0EB',
    contrastText: '#FFFFFF',
    gradient: 'linear-gradient(102.11deg, #4A4E42 2.24%, #6B705C 98.95%)',
  },
  successVivid: {
    main: '##22bb33',
    dark: '#226B3A',
    light: '#E6F4EC',
    contrastText: '#FFFFFF',
    gradient: 'linear-gradient(102.11deg, #226B3A 2.24%, #2F8F4E 98.95%)',
  },

  /**
   * BRAND / ACCENT RED
   * - Başlık alt çizgisi
   * - Badge
   * - Aktif tab underline
   * - Slider dot aktif
   * - Küçük accent alanlar
   * NOT: Primary buton rengi değil.
   */
  accentRed: {
    main: '#C1121F',
    light: '#FDEBEC',
    dark: '#8B0D14',
    deepDark: '#5A080D',
    contrastText: '#FFFFFF',
    gradient:
      'linear-gradient(102.75deg, #5A080D 2.2%, #8B0D14 45.17%, #C1121F 82.3%)',
  },

  /**
   * ❌ ERROR / DANGER
   * - Sil / İptal / Hata durumları
   * Kırmızı semantic kullanımı
   */
  error: {
    main: '#C1121F',
    dark: '#8B0D14',
    light: '#FDEBEC',
    contrastText: '#FFFFFF',
    gradient:
      'linear-gradient(102.11deg, #8B0D14 2.24%, #C1121F 98.95%)',
  },

  warning: {
    main: '#FFC003',
    dark: '#CCA300',
    light: '#FFFAE3',
    contrastText: '#1C1C1E',
    gradient:
      'linear-gradient(102.11deg, #FFC003 2.24%, #FFDA69 98.95%)',
  },

  /**
   * SECONDARY = İkincil aksiyonlar (outline, daha hafif butonlar, filter pill, vs.)
   * Koyu gri
   */
  secondary: {
    main: '#3A3A3C',
    light: '#6E6E73',
    dark: '#1C1C1E',
    contrastText: '#FFFFFF',
    gradient:
      'linear-gradient(180deg, #1C1C1E 0%, #3A3A3C 100%)',
  },

  /* 🎚️ GRAY / NEUTRAL SYSTEM */
  gray: {
    900: '#0B0B0D',
    800: '#1C1C1E',
    700: '#2C2C2E',
    600: '#3A3A3C',
    500: '#6E6E73',
    400: '#8E8E93',
    300: '#AEAEB2',
    200: '#D1D1D6',
    100: '#E5E5EA',
    50: '#F5F5F7',
  },

  /**
   * TERTIARY / NEUTRAL
   * Daha “pasif” actionlar, badge arka planları, soft border’lar
   */
  tertiary: {
    main: '#6E6E73',
    light: '#E5E5EA',
    dark: '#AEAEB2',
    contrastText: '#1C1C1E',
  },

  neutral: {
    main: '#6E6E73',
    light: '#FAFAFA',
    dark: '#D1D1D6',
    contrastText: '#1C1C1E',
  },

  text: {
    main: '#1C1C1E',      // body
    medium: '#3A3A3C',    // title / strong
    mediumLight: '#6E6E73',
    light: '#8E8E93',
    secondary: '#3A3A3C',
    disabled: '#AEAEB2',
  },

  white: {
    main: '#FFFFFF',
    contrastText: '#1C1C1E',
  },

  gradient: {
    main:
      'linear-gradient(102.75deg, #5A080D 2.2%, #8B0D14 45.17%, #C1121F 82.3%)',
    vivid:
      'linear-gradient(102.11deg, #8B0D14 2.24%, #C1121F 50.27%, #E63946 98.95%)',
    light:
      'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
    blue:
      'linear-gradient(102.11deg, #00327D 2.24%, #1754B0 98.95%)',
  },
};

export type Palette = typeof defaultPalette;
