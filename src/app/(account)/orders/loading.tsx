'use client';

import Icon from '@/components/Icon';
import InfoItem from '@/components/InfoItem';
import Card from '@/components/common/Card';
import { Skeleton, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

const Loading = () => {
  return (
    <Stack gap={2} width="100%">
      <Typography variant="h2">Siparişlerim</Typography>

      <Stack gap={1}>
        <Card border sx={{ p: 2, flexDirection: 'row', alignItems: 'center' }}>
          <Grid container columnSpacing={1} rowSpacing={2} width="100%">
            <Grid item xs={12} sm={2.5} md={2}>
              <InfoItem label="Sipariş No" />
            </Grid>

            <Grid item xs={12} sm={5.5} md={3}>
              <InfoItem label="Sipariş Tarihi" />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <InfoItem label="Sipariş Durumu" />
            </Grid>
          </Grid>

          <Icon name="chevron_right" />
        </Card>

        <Skeleton variant="rounded" sx={{ height: { xs: 185, sm: 76 } }} />
        <Skeleton variant="rounded" sx={{ height: { xs: 185, sm: 76 } }} />
      </Stack>
    </Stack>
  );
};

export default Loading;
