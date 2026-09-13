import { cn } from '@/lib/utils/cn';

/**
 * Flex konteyner — MUI `<Stack>` yerine.
 *
 * Server component: çalışma zamanı yok, sadece class üretir.
 * `sx` KABUL ETMEZ (ADR-0002 §5.3) — ek stil `className` ile gelir.
 *
 * Sınıf adları literal olmak zorunda; Tailwind kaynağı statik tarar,
 * `gap-${n}` derlenmez. Bu yüzden eşleme tabloları kullanılıyor.
 */

/** MUI spacing (8px) -> Tailwind (4px): MUI değeri × 2. docs/migration/konvansiyon.md §1 */
const GAP = {
  0: 'gap-0',
  0.5: 'gap-1',
  0.75: 'gap-1.5',
  1: 'gap-2',
  1.5: 'gap-3',
  2: 'gap-4',
  2.5: 'gap-5',
  3: 'gap-6',
  3.5: 'gap-7',
  4: 'gap-8',
  5: 'gap-10',
  6: 'gap-12',
  8: 'gap-16',
  10: 'gap-20',
} as const;

const DIRECTION = {
  row: 'flex-row',
  column: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'column-reverse': 'flex-col-reverse',
} as const;

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

export type SpacingToken = keyof typeof GAP;

type StackElement = 'div' | 'section' | 'article' | 'header' | 'footer' | 'nav' | 'ul' | 'ol' | 'li' | 'form' | 'label';

export type StackProps = {
  direction?: keyof typeof DIRECTION;
  gap?: SpacingToken;
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
  as?: StackElement;
  className?: string;
  children?: React.ReactNode;
  id?: string;
};

export function Stack({
  direction = 'column',
  gap,
  align,
  justify,
  wrap,
  as: Component = 'div',
  className,
  children,
  id,
}: StackProps) {
  return (
    <Component
      id={id}
      className={cn(
        'flex',
        DIRECTION[direction],
        gap !== undefined && GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && 'flex-wrap',
        className,
      )}
    >
      {children}
    </Component>
  );
}

export default Stack;
