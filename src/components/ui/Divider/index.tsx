import { cn } from '@/lib/utils/cn';

/**
 * Ayraç — MUI `<Divider>` yerine.
 *
 * Renk `theme.ts:415-421`'deki MuiDivider override'ından geliyor:
 * borderColor = palette.text.light.
 *
 * Server component. Sunum amaçlı olduğu için `role="separator"` yerine
 * `<hr>` kullanılıyor — semantik karşılığı zaten bu.
 */
export type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <hr
      className={cn(
        'border-0 border-text-light',
        orientation === 'vertical' ? 'h-auto self-stretch border-l' : 'w-full border-t',
        className,
      )}
    />
  );
}

export default Divider;
