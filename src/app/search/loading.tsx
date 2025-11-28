'use client';

import { ProductCardSkeleton } from '@/components/ProductCard';
import TwoColumnLayout, {
  SecondaryColumn,
  PrimaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import { Grid, Skeleton, Stack } from '@mui/material';

const Loading = () => {
  return (
    <TwoColumnLayout>
      <SecondaryColumn
        sx={{
          width: { sm: '100%', md: 200 },
          minWidth: { md: 200 },
          maxWidth: { sm: 200 },
          gap: 1,
          display: { xs: 'none', sm: 'flex' },
        }}
      >
        <Skeleton width={80} sx={{ fontSize: 14 }} />
        <Skeleton width={100} sx={{ fontSize: 14 }} />
        <Skeleton width={90} sx={{ fontSize: 14 }} />
        <Skeleton width={110} sx={{ fontSize: 14 }} />
        <Skeleton width={105} sx={{ fontSize: 14 }} />
      </SecondaryColumn>
      <PrimaryColumn>
        <Stack gap={2}>
          <Skeleton
            width={180}
            sx={{
              fontWeight: 700,
              fontSize: { xs: 18, sm: 20 },
              lineHeight: { xs: '22px', sm: '24px' },
            }}
          />
          <Grid container columnSpacing={2.5} rowSpacing={3}>
            {Array.from(Array(20).keys()).map((e) => (
              <Grid item xs={6} sm={4} md={3} key={e}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </PrimaryColumn>
    </TwoColumnLayout>
  );
};

export default Loading;
