import { Skeleton } from '@/components/ui/Skeleton';
import { Stack } from '@/components/ui/Stack';
import { ProductCardSkeleton } from '@/components/ProductCard';
import TwoColumnLayout, {
  SecondaryColumn,
  PrimaryColumn,
} from '@/components/layouts/TwoColumnLayout';

/**
 * ADR-0002 Faz 2 (F2.1) — Skeleton'lar dönüştürüldü, `'use client'` kaldırıldı.
 *
 * Metin iskeletlerinin yüksekliği font-size'tan gelir (MUI'de de öyle),
 * bu yüzden eski `sx={{ fontSize: 14 }}` -> `className="text-[14px]"`.
 */
const Loading = () => {
  return (
    <TwoColumnLayout>
      <SecondaryColumn
        className="hidden gap-2 sm:flex sm:w-full sm:max-w-[280px] md:w-[280px] md:min-w-[280px]"
      >
        <Skeleton width={80} className="text-[14px]" />
        <Skeleton width={100} className="text-[14px]" />
        <Skeleton width={90} className="text-[14px]" />
        <Skeleton width={110} className="text-[14px]" />
        <Skeleton width={105} className="text-[14px]" />
      </SecondaryColumn>

      <PrimaryColumn>
        <Stack gap={2}>
          <Skeleton
            width={180}
            className="text-[18px] font-bold leading-[22px] sm:text-[20px] sm:leading-[24px]"
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
            {Array.from(Array(20).keys()).map((e) => (
              <div key={e}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </Stack>
      </PrimaryColumn>
    </TwoColumnLayout>
  );
};

export default Loading;
