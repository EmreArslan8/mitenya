'use client';

import { Skeleton, Stack, Typography } from '@mui/material';

const OrderCardSkeleton = () => (
  <Stack
    direction="row"
    alignItems="center"
    sx={{
      borderRadius: '12px',
      border: (theme) => `1px solid ${theme.palette.gray[100]}`,
      overflow: 'hidden',
    }}
  >
    <Skeleton
      variant="rectangular"
      sx={{ width: 4, alignSelf: 'stretch', flexShrink: 0 }}
    />
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, gap: 2 }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 1.5, sm: 3 }}
        flex={1}
      >
        <Stack gap={0.5}>
          <Skeleton variant="text" width={50} height={14} />
          <Skeleton variant="text" width={90} height={18} />
        </Stack>
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton variant="rounded" width={72} height={26} sx={{ borderRadius: '6px' }} />
      </Stack>
      <Skeleton variant="circular" width={18} height={18} />
    </Stack>
  </Stack>
);

const Loading = () => {
  return (
    <Stack gap={4} width="100%">
      <Stack gap={1}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, letterSpacing: -0.3 }}
          >
            Siparişlerim
          </Typography>
          <Skeleton
            variant="rounded"
            width={24}
            height={20}
            sx={{ borderRadius: '4px' }}
          />
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
