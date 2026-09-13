import { Skeleton } from '@/components/ui/Skeleton';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';

/**
 * ADR-0002 Faz 2 (F2.1) — MUI'siz, Emotion'sız.
 * `'use client'` kaldırıldı: dosyada etkileşim yok, artık server component.
 *
 * Dönüşüm (konvansiyon.md §1/§3):
 *   gray[100] -> border-gray-100 · p {xs:1.5, sm:2} -> p-3 sm:p-4
 *   gap {xs:1.5, sm:3} -> gap-3 sm:gap-6 · gap 4 -> gap-8
 *   letterSpacing -0.3 (sayı = px) -> tracking-[-0.3px]
 */

const OrderCardSkeleton = () => (
  <Stack
    direction="row"
    align="center"
    className="overflow-hidden rounded-[12px] border border-gray-100"
  >
    <Skeleton variant="rectangular" className="w-1 shrink-0 self-stretch" />

    <Stack direction="row" align="center" justify="between" className="flex-1 gap-4 p-3 sm:p-4">
      <Stack className="flex-1 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
        <Stack gap={0.5}>
          <Skeleton variant="text" width={50} height={14} />
          <Skeleton variant="text" width={90} height={18} />
        </Stack>
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton variant="rounded" width={72} height={26} className="rounded-[6px]" />
      </Stack>

      <Skeleton variant="circular" width={18} height={18} />
    </Stack>
  </Stack>
);

const Loading = () => {
  return (
    <Stack gap={4} className="w-full">
      <Stack gap={1}>
        <Stack direction="row" align="center" gap={1.5}>
          <Typography
            variant="h2"
            className="text-[22px] font-extrabold tracking-[-0.3px] sm:text-[26px]"
          >
            Siparişlerim
          </Typography>
          <Skeleton variant="rounded" width={24} height={20} className="rounded-[4px]" />
        </Stack>
        <Skeleton variant="text" width={300} height={20} />
      </Stack>

      <Stack gap={1.5}>
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </Stack>
    </Stack>
  );
};

export default Loading;
