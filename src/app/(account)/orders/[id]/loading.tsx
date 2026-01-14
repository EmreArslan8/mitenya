'use client';

import { Stack, Skeleton, Typography, Divider } from '@mui/material';
import Button from '@/components/common/Button';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import Card from '@/components/common/Card';
import AddressCard from '@/components/AddressCard';
import { useRouter } from 'next/navigation';

const OrderDetailsLoading = () => {
  const router = useRouter();

  return (
    <Stack gap={1} width="100%">
      <Button
        size="small"
        color="tertiary"
        arrow="start"
        onClick={() => router.push('/orders')}
        sx={{ alignSelf: 'start', mx: -1 }}
      >
        Geri Dön
      </Button>

      <TwoColumnLayout>
        <PrimaryColumn>
          <Card border sx={{ display: 'flex', p: 1.5 }}>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="15%" sx={{ ml: 1 }} />
            </Stack>

            <Skeleton variant="text" width="30%" sx={{ marginBottom: '2px' }} />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="50%" />
          </Card>

          <Card border iconName="list" title="Ürünler">
            <Skeleton variant="rectangular" height={112} width="100%" />
          </Card>
        </PrimaryColumn>

        <SecondaryColumn>
          <Card
            iconName="receipt_long"
            title="Sipariş Özeti"
            border
          >
            <Stack py={2} px={3}>
              <Stack gap={1}>
                <Stack
                  gap={0.5}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="warning">
                    Ürünler Toplamı
                  </Typography>
                  <Skeleton variant="text" width="30%" height={25.5} />
                </Stack>

                <Divider flexItem />

                <Stack
                  gap={0.5}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="warning">
                    Kargo ve Hizmet Bedeli
                  </Typography>
                  <Skeleton variant="text" width="30%" height={25.5} />
                </Stack>
              </Stack>
            </Stack>

            <Divider flexItem />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              py={2}
              px={3}
            >
              <Typography fontSize={15} fontWeight={700} lineHeight={1}>
                Ödenecek Tutar
              </Typography>
              <Skeleton variant="text" width="35%" height={18} />
            </Stack>
          </Card>

          <Card border>
            <AddressCard />
          </Card>
        </SecondaryColumn>
      </TwoColumnLayout>
    </Stack>
  );
};

export default OrderDetailsLoading;
