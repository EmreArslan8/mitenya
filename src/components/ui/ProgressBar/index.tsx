import { cn } from '@/lib/utils/cn';

/**
 * Belirsiz (indeterminate) çizgi göstergesi — MUI `<LinearProgress>` yerine.
 *
 * Server component. MUI iki ayrı çubuğu farklı eğri ve gecikmeyle hareket
 * ettirir; ikisi de `globals.css`'te birebir tanımlı:
 *   bar1  2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395)
 *   bar2  2.1s cubic-bezier(0.165, 0.84, 0.44, 1)  1.15s gecikmeli
 *
 * Yükseklik 4px. Zemin MUI'de `lighten(palette[color].main, 0.62)`; burada
 * token üzerinden `bg-primary/20` ile sadeleştirildi — tek kullanım yeri tam
 * ekran yükleme örtüsü olduğu için fark görünmüyor. (Bilinçli sapma.)
 */
export type ProgressBarProps = {
  className?: string;
  label?: string;
  /** Verilirse 0–100 arası belirli ilerleme gösterir. */
  value?: number;
  indicatorClassName?: string;
};

export function ProgressBar({ className, label = 'Yükleniyor', value, indicatorClassName }: ProgressBarProps) {
  const determinate = typeof value === 'number';
  const normalizedValue = determinate ? Math.min(100, Math.max(0, value)) : undefined;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={normalizedValue}
      className={cn('relative h-1 w-full overflow-hidden bg-primary/20', className)}
    >
      {determinate ? (
        <span className={cn('absolute inset-y-0 left-0 bg-primary transition-[width] duration-200', indicatorClassName)} style={{ width: `${normalizedValue}%` }} />
      ) : (
        <>
          <span className="animate-progress-bar1 absolute bottom-0 top-0 w-auto bg-primary" />
          <span className="animate-progress-bar2 absolute bottom-0 top-0 w-auto bg-primary" />
        </>
      )}
    </div>
  );
}

export default ProgressBar;
