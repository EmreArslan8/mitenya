'use client';

import { Stack, Skeleton, Divider } from '@mui/material';
import Button from '@/components/common/Button';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import { ArrowLeft } from '@/components/icons';
import { useRouter } from 'next/navigation';

const CardShell = ({ children }: { children: React.ReactNode }) => (
  <Stack
    sx={{
      borderRadius: '12px',
      border: (theme) => `1px solid ${theme.palette.gray[100]}`,
      bgcolor: 'white.main',
      overflow: 'hidden',
    }}
  >
    {children}
  </Stack>
);

const CardHeader = ({ width = 80 }: { width?: number }) => (
  <Stack
    sx={{
      px: { xs: 2, sm: 2.5 },
      py: 1.5,
      borderBottom: (theme) => `1px solid ${theme.palette.gray[100]}`,
    }}
  >
    <Skeleton variant="text" width={width} height={14} />
  </Stack>
);

const OrderDetailsLoading = () => {
  const router = useRouter();

  return (
    <Stack gap={2} width="100%">
      <Button
        size="small"
        color="tertiary"
        onClick={() => router.push('/orders')}
        startIcon={<ArrowLeft size={16} />}
        sx={{
          alignSelf: 'start',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 14,
          color: 'text.mediumLight',
          px: 0,
        }}
      >
        Siparişlerim
      </Button>

      <TwoColumnLayout>
        <PrimaryColumn>
          {/* Status card skeleton */}
          <CardShell>
            <CardHeader width={100} />
            <Stack sx={{ px: { xs: 2, sm: 2.5 }, py: 2.5, gap: 2.5 }}>
              {/* Timeline stepper */}
              <Stack direction="row" justifyContent="space-between" gap={2}>
                {[1, 2, 3].map((i) => (
                  <Stack key={i} alignItems="center" flex={1} gap={1}>
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="text" width={60} height={14} />
                  </Stack>
                ))}
              </Stack>
              <Skeleton variant="text" width="85%" height={16} />
            </Stack>
          </CardShell>

          {/* Products card skeleton */}
          <CardShell>
            <CardHeader width={60} />
            <Stack gap={0}>
              {[1, 2].map((i) => (
                <Stack key={i}>
                  <Stack
                    direction="row"
                    gap={2}
                    sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}
                  >
                    <Skeleton
                      variant="rounded"
                      width={72}
                      height={72}
                      sx={{ borderRadius: '10px', flexShrink: 0 }}
                    />
                    <Stack flex={1} justifyContent="center" gap={0.5}>
                      <Skeleton variant="text" width="70%" height={16} />
                      <Skeleton variant="text" width="40%" height={14} />
                    </Stack>
                    <Stack justifyContent="center" alignItems="flex-end">
                      <Skeleton variant="text" width={80} height={18} />
                    </Stack>
                  </Stack>
                  {i < 2 && (
                    <Divider sx={{ mx: 2.5, borderColor: 'gray.100' }} />
                  )}
                </Stack>
              ))}
            </Stack>
          </CardShell>
        </PrimaryColumn>

        <SecondaryColumn>
          {/* Summary card skeleton */}
          <CardShell>
            <CardHeader width={90} />
            <Stack sx={{ px: { xs: 2, sm: 2.5 }, py: 2, gap: 1.5 }}>
              {[1, 2, 3].map((i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Skeleton variant="text" width={120} height={16} />
                  <Skeleton variant="text" width={70} height={16} />
                </Stack>
              ))}
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderTop: (theme) => `1px solid ${theme.palette.gray[100]}`,
                bgcolor: 'bg.light',
              }}
            >
              <Skeleton variant="text" width={100} height={18} />
              <Skeleton variant="text" width={90} height={22} />
            </Stack>
          </CardShell>

          {/* Address card skeleton */}
          <CardShell>
            <Stack sx={{ p: { xs: 2, sm: 2.5 }, gap: 1.5 }}>
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
