import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { typographyVariants } from './variants';

/**
 * Metin — MUI `<Typography>` yerine (aynı adı taşır, farklı pakettir).
 *
 * DİKKAT: Geçiş sürerken bir dosya hem MUI'nin hem bunun `Typography`'sini
 * import edemez — isim çakışır. Bir dosya ya tamamen dönüşmüştür ya hiç
 * (ADR-0002 §5.3); zaten kural bu.
 *
 * Server component, çalışma zamanı yok.
 * `sx` KABUL ETMEZ; renk/boşluk gibi ekler `className` ile verilir.
 *
 * `variant` görünümü, `as` semantiği belirler ve BAĞIMSIZDIR:
 *   <Typography variant="h2" as="h3">  // h2 gibi görünen, belge yapısında h3 olan başlık
 * MUI'deki `component` propunun karşılığı budur (74 kullanım).
 */

const DEFAULT_TAG = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
} as const;

type TypographyElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em' | 'li';

export type TypographyProps = VariantProps<typeof typographyVariants> & {
  as?: TypographyElement;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  htmlFor?: string;
};

export function Typography({ variant, align, as, className, children, id, htmlFor }: TypographyProps) {
  // Başlık varyantları semantik karşılığına düşer; gerisi <p>.
  const Component: React.ElementType =
    as ?? (variant && variant in DEFAULT_TAG ? DEFAULT_TAG[variant as keyof typeof DEFAULT_TAG] : 'p');

  return (
    <Component
      id={id}
      // htmlFor yalnızca <label> için anlamlı; başka etikete sızarsa React uyarır.
      {...(Component === 'label' && htmlFor ? { htmlFor } : {})}
      className={cn(typographyVariants({ variant, align }), className)}
    >
      {children}
    </Component>
  );
}

export default Typography;
