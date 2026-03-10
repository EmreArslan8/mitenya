'use client';

import { Divider, Grid, Skeleton, Stack } from '@mui/material';

const Loading = () => {
  return (
    <Stack gap={{ xs: 4, sm: 5 }}>
      <Stack gap={2}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ px: { xs: 2, sm: 0 } }}>
          <Skeleton variant="text" width={72} sx={{ fontSize: 13 }} />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton variant="text" width={84} sx={{ fontSize: 13 }} />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton variant="text" width={94} sx={{ fontSize: 13 }} />
        </Stack>

        <Grid container columnSpacing={{ sm: 5 }} rowSpacing={{ xs: 3, sm: 0 }}>
          <Grid item xs={12} sm={6}>
            <Stack gap={1.5}>
              <Skeleton
                variant="rounded"
                width="100%"
                height={0}
                sx={{
                  pt: { xs: '118%', sm: '110%' },
                  borderRadius: { xs: 0, sm: 1.5 },
                }}
              />
              <Stack direction="row" gap={1} sx={{ px: { xs: 2, sm: 0 } }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={72}
                    height={72}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack gap={2.25} sx={{ px: { xs: 2, sm: 0 } }}>
              <Stack gap={1}>
                <Skeleton variant="text" width={90} sx={{ fontSize: 13 }} />
                <Skeleton variant="text" width="88%" sx={{ fontSize: 34, lineHeight: '42px' }} />
                <Skeleton variant="text" width="72%" sx={{ fontSize: 34, lineHeight: '42px' }} />
              </Stack>

              <Stack direction="row" alignItems="center" gap={1}>
                <Skeleton variant="text" width={110} sx={{ fontSize: 14 }} />
                <Skeleton variant="text" width={44} sx={{ fontSize: 14 }} />
              </Stack>

              <Stack gap={1.25}>
                <Skeleton variant="rounded" width={112} height={30} sx={{ borderRadius: 999 }} />
                <Skeleton variant="text" width="100%" sx={{ fontSize: 15 }} />
                <Skeleton variant="text" width="92%" sx={{ fontSize: 15 }} />
                <Skeleton variant="text" width="70%" sx={{ fontSize: 15 }} />
                <Divider />
              </Stack>

              <Skeleton variant="text" width={132} sx={{ fontSize: 15 }} />

              <Stack direction="row" alignItems="center" gap={1}>
                <Skeleton variant="text" width={92} sx={{ fontSize: 18 }} />
                <Skeleton variant="text" width={140} sx={{ fontSize: 30 }} />
                <Skeleton variant="rounded" width={92} height={28} sx={{ borderRadius: 999 }} />
              </Stack>

              <Stack gap={1.5}>
                <Skeleton variant="rounded" width="100%" height={54} sx={{ borderRadius: 999 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                  <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: 999 }} />
                  <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: 999 }} />
                </Stack>
              </Stack>

              <Stack gap={1.25} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                {Array.from({ length: 2 }).map((_, index) => (
                  <Stack key={index} direction="row" gap={1.25} alignItems="flex-start">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Stack flex={1} gap={0.6}>
                      <Skeleton variant="text" width={140} sx={{ fontSize: 15 }} />
                      <Skeleton variant="text" width="94%" sx={{ fontSize: 13 }} />
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              <Stack gap={1}>
                <Skeleton variant="text" width={124} sx={{ fontSize: 12 }} />
                <Skeleton variant="text" width="82%" sx={{ fontSize: 14 }} />
                <Skeleton variant="text" width="74%" sx={{ fontSize: 14 }} />
              </Stack>

              <Stack gap={1}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" width="100%" height={52} sx={{ borderRadius: 1.5 }} />
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <Stack gap={3} sx={{ px: { xs: 2, sm: 4 } }}>
        <Stack gap={2}>
          <Skeleton variant="text" width={210} sx={{ fontSize: 36, lineHeight: '40px' }} />
          <Skeleton variant="rounded" width="100%" height={220} sx={{ borderRadius: 2 }} />
          <Stack gap={1.5}>
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" width="100%" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        </Stack>

        <Stack gap={2}>
          <Skeleton variant="text" width={198} sx={{ fontSize: 36, lineHeight: '40px' }} />
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Stack gap={1}>
                  <Skeleton variant="rounded" width="100%" height={0} sx={{ pt: '132%', borderRadius: 1.5 }} />
                  <Skeleton variant="text" width={84} sx={{ fontSize: 12 }} />
                  <Skeleton variant="text" width="100%" sx={{ fontSize: 15 }} />
                  <Skeleton variant="text" width="78%" sx={{ fontSize: 15 }} />
                  <Skeleton variant="text" width={92} sx={{ fontSize: 18 }} />
                  <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 1.5 }} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Loading;
