'use client';

import { ShopOrderListItemData } from '@/lib/api/types';
import Card from '@/components/common/Card';
import InfoItem from '@/components/InfoItem';
import parseDate from '@/lib/utils/parseDate';
import { Box, Chip, Stack } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useStyles from './styles';

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; indicator: string }
> = {
  processing: {
    label: 'Sipariş Alındı',
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
    color: '#B45309',
    bg: '#FFF7ED',
    indicator: '#F59E0B',
  },
  delivered: {
    label: 'Teslim Edildi',
    color: '#226B3A',
    bg: '#E6F4EC',
    indicator: '#2F8C4B',
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
  const orderNo = data.orderId || data.id;
  const totalProductCount = data.totalProductCount || 0;
  const productSummary = data.firstProductName
    ? `${data.firstProductName}${totalProductCount > 1 ? ` +${totalProductCount - 1} ürün` : ''}`
    : 'Ürün detayı yüklenemedi';

  const formattedTotal = typeof data.totalAmount === 'number'
    ? new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: data.currency || 'TRY',
      }).format(data.totalAmount)
    : '-';

  const formattedDate = (() => {
    const d = new Date(data.createdDate);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    try {
      return parseDate(data.createdDate);
    } catch {
      return data.createdDate;
    }
  })();

  return (
    <Card
      border
      sx={styles.card}
      onClick={() => router.push(`/orders/${data.id}`)}
    >
      <Stack sx={styles.content}>
        <Box sx={{ ...styles.statusIndicator, bgcolor: config.indicator }} />

        <Box sx={styles.infoGrid}>
          <Box sx={styles.infoCell}>
            <InfoItem
              label="Sipariş No"
              value={`#${orderNo}`}
              slotProps={{
                label: { sx: styles.metaLabel },
                value: { sx: styles.orderId },
              }}
            />
          </Box>

          <Box sx={styles.infoCell}>
            <InfoItem
              label="Sipariş Tarihi"
              value={formattedDate}
              slotProps={{
                label: { sx: styles.metaLabel },
                value: { sx: styles.metaValue },
              }}
            />
          </Box>

          <Box sx={styles.infoCell}>
            <InfoItem
              label="Ürünler"
              value={productSummary}
              slotProps={{
                label: { sx: styles.metaLabel },
                value: { sx: styles.metaValueEllipsis },
              }}
            />
          </Box>

          <Box sx={styles.infoCell}>
            <InfoItem
              label="Toplam Tutar"
              value={formattedTotal}
              slotProps={{
                label: { sx: styles.metaLabel },
                value: { sx: styles.totalValue },
              }}
            />
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" gap={1} sx={styles.actionArea}>
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
          <Box className="order-arrow" sx={styles.arrowContainer}>
            <ChevronRight size={18} />
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
};

export default OrderListItemCard;
