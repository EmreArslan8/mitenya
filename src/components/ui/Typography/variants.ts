import { cva } from 'class-variance-authority';

/**
 * Tipografi varyantları — MUI `<Typography variant>` yerine.
 *
 * İki kaynak var, ikisi de ÖLÇÜLDÜ (tahmin edilmedi):
 *
 * 1. `src/theme/theme.ts:474-560` — projenin kendi override'ları
 *    (h1-h3, cardTitle, body, warning, warningSemibold, infoLabel, infoValue,
 *     progressLabel, progressLabelBold, progressNumber)
 *
 * 2. MUI v5 varsayılanları — theme.ts'te override EDİLMEYENLER
 *    (h4-h6, subtitle1/2, body1, body2, caption, overline).
 *    Değerler `createTheme().typography` çalıştırılarak okundu; rem -> px
 *    dönüşümü htmlFontSize=16 ile yapıldı. lineHeight'lar MUI'de katsayı,
 *    burada da katsayı olarak bırakıldı (leading-[1.43] gibi).
 *
 * letterSpacing değerleri de taşındı: MUI onları em cinsinden veriyor ve
 * atlanırsa metin genişliği değişir — görsel eşdeğerlik bozulur.
 */
export const typographyVariants = cva('', {
  variants: {
    variant: {
      // --- theme.ts override'ları (responsive olanlar sm: ile) ---
      h1: 'font-bold text-[24px] leading-[29px] sm:text-[28px] sm:leading-[34px]',
      h2: 'font-bold text-[18px] leading-[22px] sm:text-[20px] sm:leading-[24px]',
      h3: 'font-bold text-[16px] leading-[20px] sm:text-[18px] sm:leading-[22px]',
      cardTitle: 'font-bold text-[14px] leading-[16.8px]',
      body: 'font-medium text-[16px] leading-[20px]',
      warning: 'font-normal text-[15px] leading-[20px]',
      warningSemibold: 'font-medium text-[15px] leading-[20px]',
      infoLabel: 'font-normal text-[14px] leading-[16.8px] sm:text-[15px] sm:leading-[18px]',
      infoValue: 'font-semibold text-[15px] leading-[19px] sm:text-[16px] sm:leading-[20px]',
      progressLabel: 'font-normal text-[13px] leading-[16px]',
      progressLabelBold: 'font-bold text-[13px] leading-[16px]',
      progressNumber: 'font-bold text-[14px] leading-[13px]',

      // --- MUI varsayılanları (theme.ts'te override edilmemiş) ---
      h4: 'font-normal text-[34px] leading-[1.235] tracking-[0.00735em]',
      h5: 'font-normal text-[24px] leading-[1.334]',
      h6: 'font-medium text-[20px] leading-[1.6] tracking-[0.0075em]',
      subtitle1: 'font-normal text-[16px] leading-[1.75] tracking-[0.00938em]',
      subtitle2: 'font-medium text-[14px] leading-[1.57] tracking-[0.00714em]',
      body1: 'font-normal text-[16px] leading-[1.5] tracking-[0.00938em]',
      body2: 'font-normal text-[14px] leading-[1.43] tracking-[0.01071em]',
      caption: 'font-normal text-[12px] leading-[1.66] tracking-[0.03333em]',
      overline: 'font-normal text-[12px] leading-[2.66] tracking-[0.08333em] uppercase',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'body1',
  },
});
