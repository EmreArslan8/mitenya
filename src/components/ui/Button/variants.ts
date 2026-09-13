import { cva } from 'class-variance-authority';

/**
 * Buton varyantları — `src/theme/theme.ts:126-236`'daki MuiButton kurallarının
 * birebir karşılığı.
 *
 * Alfa ekleri: eski tema renklere onaltılık alfa ekliyordu (`${main}20`).
 * `20` = 0x20/0xFF = %12,5 — `/20` (=%20) YAZMAK YANLIŞ OLUR.
 * Dönüşüm tablosu: docs/migration/konvansiyon.md §3.
 *
 * DOKÜMANTE EDİLMİŞ YAKLAŞIKLIK: `contained` varyantının primary DIŞINDAKİ
 * renkleri temada override edilmemişti; MUI hover rengini çalışma zamanında
 * `darken()` ile üretiyordu. Burada bunun yerine palette'in kendi `-dark`
 * token'ı kullanılıyor. Değerler yakın ama birebir aynı olmayabilir;
 * pilot dilimde gözle karşılaştırılacak.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'min-w-16 box-border shrink-0 whitespace-nowrap',
    // theme.ts styleOverrides.root
    'uppercase font-extrabold rounded-none',
    'border border-solid border-transparent',
    'cursor-pointer transition-colors',
    'disabled:cursor-default',
  ],
  {
    variants: {
      variant: {
        contained: '',
        outlined: 'bg-white',
        tonal: 'border-transparent',
        text: 'border-transparent bg-transparent hover:bg-black/[4%]',
      },
      color: {
        primary: '',
        secondary: '',
        error: '',
        neutral: '',
        tertiary: '',
      },
      size: {
        // theme.ts styleOverrides.sizeSmall / sizeMedium / sizeLarge
        small: 'h-9 px-5 py-1.5 text-[14px]',
        medium: 'h-[46px] px-6 py-2 text-[16px]',
        large: 'h-14 px-8 py-3 text-[14px]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      // ---- contained ----
      // theme.ts: props {color:'primary', variant:'contained'}
      // Dikkat: arka plan text.main, hover'da primary.main. Temadaki hâli bu.
      {
        variant: 'contained',
        color: 'primary',
        class:
          'bg-text text-white border-text hover:bg-primary hover:border-primary disabled:bg-text-light disabled:border-text-light disabled:text-text-disabled',
      },
      { variant: 'contained', color: 'error', class: 'bg-error text-error-contrast-text hover:bg-error-dark disabled:bg-text-light disabled:text-text-disabled' },
      { variant: 'contained', color: 'secondary', class: 'bg-secondary text-secondary-contrast-text hover:bg-secondary-dark disabled:bg-text-light disabled:text-text-disabled' },
      { variant: 'contained', color: 'neutral', class: 'bg-neutral text-neutral-contrast-text hover:bg-neutral-dark disabled:bg-text-light disabled:text-text-disabled' },
      { variant: 'contained', color: 'tertiary', class: 'bg-tertiary text-tertiary-contrast-text hover:bg-tertiary-dark disabled:bg-text-light disabled:text-text-disabled' },

      // ---- outlined ----
      // theme.ts'te outlined+primary EN SONDA tanımlı → jenerik kuralı ezer (2px kenarlık).
      {
        variant: 'outlined',
        color: 'primary',
        class:
          'border-2 border-text text-text hover:border-text hover:bg-bg-light disabled:text-text/[37.6%] disabled:border-text/[37.6%]',
      },
      // theme.ts: props {color:'secondary', variant:'outlined'}
      { variant: 'outlined', color: 'secondary', class: 'border-secondary text-secondary hover:bg-secondary-light disabled:text-secondary/[50.2%] disabled:border-secondary/[50.2%]' },
      // jenerik outlined (buttonVariantMappingColors)
      { variant: 'outlined', color: 'error', class: 'border-error text-error hover:bg-error-light disabled:text-error/[50.2%] disabled:border-error/[50.2%]' },
      { variant: 'outlined', color: 'neutral', class: 'border-neutral text-neutral hover:bg-neutral-light disabled:text-neutral/[50.2%] disabled:border-neutral/[50.2%]' },
      // tertiary buttonVariantMappingColors listesinde YOK → temada özel kuralı da yoktu.
      { variant: 'outlined', color: 'tertiary', class: 'border-tertiary text-tertiary hover:bg-tertiary-light disabled:text-tertiary/[50.2%] disabled:border-tertiary/[50.2%]' },

      // ---- tonal ----
      // theme.ts: props {color:'secondary', variant:'tonal'} -> 10/20 (=%6,27 / %12,5)
      { variant: 'tonal', color: 'secondary', class: 'text-secondary bg-secondary/[6.27%] hover:bg-secondary/[12.5%] disabled:text-secondary/[50.2%]' },
      // jenerik tonal -> 20/40 (=%12,5 / %25,1)
      { variant: 'tonal', color: 'primary', class: 'text-primary bg-primary/[12.5%] hover:bg-primary/[25.1%] disabled:text-primary/[50.2%]' },
      { variant: 'tonal', color: 'error', class: 'text-error bg-error/[12.5%] hover:bg-error/[25.1%] disabled:text-error/[50.2%]' },
      { variant: 'tonal', color: 'neutral', class: 'text-neutral bg-neutral/[12.5%] hover:bg-neutral/[25.1%] disabled:text-neutral/[50.2%]' },
      { variant: 'tonal', color: 'tertiary', class: 'text-tertiary bg-tertiary/[12.5%] hover:bg-tertiary/[25.1%] disabled:text-tertiary/[50.2%]' },

      // ---- text ----
      { variant: 'text', color: 'primary', class: 'text-primary disabled:text-primary/[50.2%]' },
      { variant: 'text', color: 'secondary', class: 'text-secondary disabled:text-secondary/[50.2%]' },
      { variant: 'text', color: 'error', class: 'text-error disabled:text-error/[50.2%]' },
      { variant: 'text', color: 'neutral', class: 'text-neutral disabled:text-neutral/[50.2%]' },
      { variant: 'text', color: 'tertiary', class: 'text-tertiary disabled:text-tertiary/[50.2%]' },
    ],
    defaultVariants: {
      // MUI varsayılanları: variant='text', color='primary', size='medium'
      variant: 'text',
      color: 'primary',
      size: 'medium',
      fullWidth: false,
    },
  },
);
