'use client';

import { ShopOrderListItemData } from '@/lib/api/types';
import parseDate from '@/lib/utils/parseDate';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useStyles from './styles';

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; indicator: string }
> = {
  processing: {
    label: 'İşleniyor',
    color: '#1754B0',
    bg: '#F5F9FF',
    indicator: '#4A87E3',
  },
  preparing: {
    label: 'Hazırlanıyor',
    color: '#CCA300',
    bg: '#FFFAE3',
    indicator: '#FFC003',
  },
  shipped: {
    label: 'Kargoda',
    color: '#226B3A',
    bg: '#E6F4EC',
    indicator: '#226B3A',
  },
  cancelled: {
    label: 'İptal',
    color: '#8B0D14',
    bg: '#FDEBEC',
    indicator: '#C1121F',
  },
};

const OrderListItemCard = ({ data }: { data: ShopOrderListItemData }) => {
  const router = useRouter();
  const styles = useStyles();
  const config = statusConfig[data.status] ?? statusConfig.processing;

  return (
    <Stack
      sx={styles.card}
      onClick={() => router.push(`/orders/${data.id}`)}
    >
      {/* Status indicator bar */}
      <Box sx={{ ...styles.statusIndicator, bgcolor: config.indicator }} />

      <Stack sx={styles.content}>
        <Stack sx={styles.infoSection}>
          {/* Order ID */}
          <Stack sx={styles.orderIdSection}>
            <Typography sx={styles.orderIdLabel}>Sipariş</Typography>
            <Typography sx={styles.orderId}>#{data.orderId}</Typography>
          </Stack>

          {/* Date */}
          <Typography sx={styles.dateText}>
            {parseDate(data.createdDate)}
          </Typography>

          {/* Status chip */}
          <Chip
            label={config.label}
            size="small"
            sx={{
              ...styles.statusChip,
              bgcolor: config.bg,
              color: config.color,
              border: `1px solid ${config.color}20`,
            }}
          />
        </Stack>

        {/* Arrow */}
        <Box className="order-arrow" sx={styles.arrowContainer}>
          <ChevronRight size={18} />
        </Box>
      </Stack>
    </Stack>
  );
};

export default OrderListItemCard;
