'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stack } from '@/components/ui/Stack';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import { ArrowLeft } from '@/components/icons';

/**
 * ADR-0002 Faz 2 (F2.1) — MUI'siz.
 * `'use client'` KALIYOR: geri butonu `useRouter` kullanıyor.
 *
 * `TwoColumnLayout` ailesi de Faz 5'te Tailwind'e geçirildi.
 *
 * Dönüşüm (konvansiyon.md §1/§3):
 *   px {xs:2, sm:2.5} -> px-4 sm:px-5 · py 2.5 -> py-5 · gap 2.5 -> gap-5
 *   gray[100] -> gray-100 · bg.light -> bg-bg-light · mx 2.5 -> mx-5
 */

const CardShell = ({ children }: { children: React.ReactNode }) => (
  <Stack className="overflow-hidden rounded-[12px] border border-gray-100 bg-white">
    {children}
  </Stack>
);

const CardHeader = ({ width = 80 }: { width?: number }) => (
  <Stack className="border-b border-gray-100 px-4 py-3 sm:px-5">
    <Skeleton variant="text" width={width} height={14} />
  </Stack>
);

const OrderDetailsLoading = () => {
  const router = useRouter();

  return (
    <Stack gap={2} className="w-full">
      <Button
        size="small"
        color="tertiary"
        onClick={() => router.push('/orders')}
        startIcon={<ArrowLeft size={16} />}
        className="self-start px-0 text-[14px] font-semibold normal-case text-text-medium-light"
      >
        Siparişlerim
      </Button>

      <TwoColumnLayout>
        <PrimaryColumn>
          {/* Durum kartı */}
          <CardShell>
            <CardHeader width={100} />
            <Stack className="gap-5 px-4 py-5 sm:px-5">
              {/* Zaman çizelgesi */}
              <Stack direction="row" justify="between" gap={2}>
                {[1, 2, 3].map((i) => (
                  <Stack key={i} align="center" gap={1} className="flex-1">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="text" width={60} height={14} />
                  </Stack>
                ))}
              </Stack>
              <Skeleton variant="text" width="85%" height={16} />
            </Stack>
          </CardShell>

          {/* Ürünler kartı */}
          <CardShell>
            <CardHeader width={60} />
            <Stack>
              {[1, 2].map((i) => (
                <Stack key={i}>
                  <Stack direction="row" gap={2} className="px-4 py-4 sm:px-5">
                    <Skeleton
                      variant="rounded"
                      width={72}
                      height={72}
                      className="shrink-0 rounded-[10px]"
                    />
                    <Stack justify="center" gap={0.5} className="flex-1">
                      <Skeleton variant="text" width="70%" height={16} />
                      <Skeleton variant="text" width="40%" height={14} />
                    </Stack>
                    <Stack justify="center" align="end">
                      <Skeleton variant="text" width={80} height={18} />
                    </Stack>
                  </Stack>
                  {i < 2 && <Divider className="mx-5 border-gray-100" />}
                </Stack>
              ))}
            </Stack>
          </CardShell>
        </PrimaryColumn>

        <SecondaryColumn>
          {/* Özet kartı */}
          <CardShell>
            <CardHeader width={90} />
            <Stack className="gap-3 px-4 py-4 sm:px-5">
              {[1, 2, 3].map((i) => (
                <Stack key={i} direction="row" align="center" justify="between">
                  <Skeleton variant="text" width={120} height={16} />
                  <Skeleton variant="text" width={70} height={16} />
                </Stack>
              ))}
            </Stack>
            <Stack
              direction="row"
              align="center"
              justify="between"
              className="border-t border-gray-100 bg-bg-light px-4 py-4 sm:px-5"
            >
              <Skeleton variant="text" width={100} height={18} />
              <Skeleton variant="text" width={90} height={22} />
            </Stack>
          </CardShell>

          {/* Adres kartı */}
          <CardShell>
            <Stack className="gap-3 p-4 sm:p-5">
              <Skeleton variant="text" width={80} height={14} />
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="text" width="70%" height={16} />
              <Skeleton variant="text" width="50%" height={16} />
            </Stack>
          </CardShell>
        </SecondaryColumn>
      </TwoColumnLayout>
    </Stack>
  );
};

export default OrderDetailsLoading;
