import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';

/**
 * Etiket + değer ikilisi. Değer henüz yoksa yer tutucu gösterir.
 *
 * ADR-0002 Faz 1 pilot dilimi: MUI'siz, Emotion'sız, server component.
 *
 * API değişikliği — MUI `slotProps` yerine açık className/variant propları:
 *   ÖNCE  slotProps={{ label: { variant: 'caption', sx: styles.metaLabel } }}
 *   SONRA labelVariant="caption" labelClassName="text-[11px] font-bold ..."
 * Gerekçe: `slotProps` keyfi MUI propu geçirmeye açık bir kapıydı (TypographyProps
 * tümü); dar ve okunur bir sözleşmeyle değiştirildi (ADR §11).
 */

type TextVariant = 'infoLabel' | 'infoValue' | 'caption' | 'cardTitle' | 'body2' | 'body1';

export interface InfoItemProps {
  label: ReactNode;
  value?: ReactNode;
  labelVariant?: TextVariant;
  valueVariant?: TextVariant;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
}

const InfoItem = ({
  label,
  value,
  labelVariant = 'infoLabel',
  valueVariant = 'infoValue',
  labelClassName,
  valueClassName,
  className,
}: InfoItemProps) => {
  return (
    <Stack gap={0.5} className={className}>
      <Typography variant={labelVariant} as="span" className={labelClassName}>
        {label}
      </Typography>
      {value ? (
        <Typography variant={valueVariant} as="span" className={valueClassName}>
          {value}
        </Typography>
      ) : (
        <Skeleton variant="rectangular" width={80} height={20} />
      )}
    </Stack>
  );
};

export default InfoItem;
