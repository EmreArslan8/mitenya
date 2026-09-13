import Image from 'next/image';
import { Divider } from '@/components/ui/Divider';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stack } from '@/components/ui/Stack';

/**
 * ADR-0002 Faz 2 (F2.1) — MUI'siz, Emotion'sız.
 * `'use client'` kaldırıldı: etkileşim yok, artık server component.
 *
 * Dönüşüm notları (konvansiyon.md §1/§3):
 *   MUI Grid -> CSS grid
 *     container columnSpacing={{sm:5}} rowSpacing={{xs:3,sm:0}} + item xs=12 sm=6
 *       -> grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-0
 *     container spacing={2} + item xs=6 sm=3
 *       -> grid grid-cols-2 gap-4 sm:grid-cols-4
 *   borderRadius: 1 -> rounded-lg (8px) · 1.5 -> rounded-[12px] · 2 -> rounded-2xl (16px)
 *                  999 -> rounded-full · 0 -> rounded-none
 *   gap 2.25 -> gap-4.5 (18px) · 1.25 -> gap-2.5 (10px) · 0.6 -> gap-[4.8px]
 *   borderColor 'divider' -> border-black/[12%]  (MUI varsayılanı rgba(0,0,0,.12);
 *     palette.ts'te `divider` anahtarı yok, token'a çevrilirse renk kayar)
 */
const Loading = () => {
  return (
    <Stack className="gap-8 sm:gap-10">
      <Stack gap={2}>
        <Stack direction="row" align="center" gap={1} className="px-4 sm:px-0">
          <Skeleton variant="text" width={72} className="text-[13px]" />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton variant="text" width={84} className="text-[13px]" />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton variant="text" width={94} className="text-[13px]" />
        </Stack>

        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-0">
          <div>
            {/* Mobil galeri */}
            <Stack gap={1} className="sm:hidden">
              <Skeleton
                variant="rounded"
                width="100%"
                height={0}
                className="rounded-none pt-[118%]"
              />
              <Stack direction="row" justify="center" gap={0.75} className="px-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="circular" width={8} height={8} />
                ))}
              </Stack>
            </Stack>

            {/* Masaüstü galeri */}
            <Stack direction="row" gap={1.5} className="hidden sm:flex">
              <Stack gap={1} className="w-[82px] min-w-[82px]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={82}
                    height={0}
                    className="rounded-lg pt-[125%]"
                  />
                ))}
              </Stack>
              <Stack
                align="center"
                justify="center"
                className="relative flex-1 sm:h-[560px] md:h-[760px]"
              >
                <Skeleton variant="rounded" className="absolute inset-0 rounded-none" />
                <Image
                  src="/static/images/logo.svg"
                  alt="Mitenya"
                  width={128}
                  height={37}
                  priority={false}
                  unoptimized
                  className="relative z-[1] opacity-[0.92]"
                />
              </Stack>
            </Stack>
          </div>

          <div>
            <Stack className="gap-4.5 px-4 sm:px-0">
              <Stack gap={1}>
                <Skeleton variant="text" width={90} className="text-[13px]" />
                <Skeleton variant="text" width="88%" className="text-[34px] leading-[42px]" />
                <Skeleton variant="text" width="72%" className="text-[34px] leading-[42px]" />
              </Stack>

              <Stack direction="row" align="center" gap={1}>
                <Skeleton variant="text" width={110} className="text-[14px]" />
                <Skeleton variant="text" width={44} className="text-[14px]" />
              </Stack>

              <Stack className="gap-2.5">
                <Skeleton variant="rounded" width={112} height={30} className="rounded-full" />
                <Skeleton variant="text" width="100%" className="text-[15px]" />
                <Skeleton variant="text" width="92%" className="text-[15px]" />
                <Skeleton variant="text" width="70%" className="text-[15px]" />
                <Divider />
              </Stack>

              <Skeleton variant="text" width={132} className="text-[15px]" />

              <Stack direction="row" align="center" gap={1}>
                <Skeleton variant="text" width={92} className="text-[18px]" />
                <Skeleton variant="text" width={140} className="text-[30px]" />
                <Skeleton variant="rounded" width={92} height={28} className="rounded-full" />
              </Stack>

              <Stack gap={1.5}>
                <Skeleton variant="rounded" width="100%" height={54} className="rounded-full" />
                <Stack className="flex-col gap-2.5 sm:flex-row">
                  <Skeleton variant="rounded" width="100%" height={52} className="rounded-full" />
                  <Skeleton variant="rounded" width="100%" height={52} className="rounded-full" />
                </Stack>
              </Stack>

              <Stack className="gap-2.5 rounded-2xl border border-black/[12%] p-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Stack key={index} direction="row" align="start" className="gap-2.5">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Stack className="flex-1 gap-[4.8px]">
                      <Skeleton variant="text" width={140} className="text-[15px]" />
                      <Skeleton variant="text" width="94%" className="text-[13px]" />
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              <Stack gap={1}>
                <Skeleton variant="text" width={124} className="text-[12px]" />
                <Skeleton variant="text" width="82%" className="text-[14px]" />
                <Skeleton variant="text" width="74%" className="text-[14px]" />
              </Stack>

              <Stack gap={1}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width="100%"
                    height={52}
                    className="rounded-[12px]"
                  />
                ))}
              </Stack>
            </Stack>
          </div>
        </div>
      </Stack>

      <Stack gap={3} className="px-4 sm:px-8">
        <Stack gap={2}>
          <Skeleton variant="text" width={210} className="text-[36px] leading-[40px]" />
          <Skeleton variant="rounded" width="100%" height={220} className="rounded-2xl" />
          <Stack gap={1.5}>
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width="100%"
                height={120}
                className="rounded-2xl"
              />
            ))}
          </Stack>
        </Stack>

        <Stack gap={2}>
          <Skeleton variant="text" width={198} className="text-[36px] leading-[40px]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Stack key={index} gap={1}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={0}
                  className="rounded-[12px] pt-[132%]"
                />
                <Skeleton variant="text" width={84} className="text-[12px]" />
                <Skeleton variant="text" width="100%" className="text-[15px]" />
                <Skeleton variant="text" width="78%" className="text-[15px]" />
                <Skeleton variant="text" width={92} className="text-[18px]" />
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={40}
                  className="rounded-[12px]"
                />
              </Stack>
            ))}
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Loading;
