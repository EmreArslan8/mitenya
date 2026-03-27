'use client';

import OrderListItemCard from '@/components/orders/OrderListItemCard';
import Button from '@/components/common/Button';
import { PagedResults, ShopOrderListItemData, ShopOrderStatus } from '@/lib/api/types';
import { UserReview } from '@/lib/api/supabaseReviews';
import { Box, Stack, Typography } from '@mui/material';
import { Package, ShoppingBag, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import useStyles from './styles';

type OrderFilter = 'all' | ShopOrderStatus;

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'processing', label: 'Sipariş Alındı' },
  { key: 'preparing', label: 'Hazırlanıyor' },
  { key: 'shipped', label: 'Kargoda' },
  { key: 'delivered', label: 'Teslim Edildi' },
  { key: 'cancelled', label: 'İptal' },
];

type OrdersPageViewProps = {
  data: PagedResults<ShopOrderListItemData>;
  section: 'orders' | 'reviews';
  reviews: UserReview[];
};

const OrdersPageView = ({ data, section, reviews }: OrdersPageViewProps) => {
  const styles = useStyles();
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const total = data.totalRecordCount ?? 0;
  const statusCounts = useMemo(
    () =>
      data.results.reduce<Record<ShopOrderStatus, number>>(
        (acc, order) => {
          acc[order.status] += 1;
          return acc;
        },
        { processing: 0, preparing: 0, shipped: 0, delivered: 0, cancelled: 0 }
      ),
    [data.results]
  );

  const filteredOrders = useMemo(
    () => data.results.filter((order) => activeFilter === 'all' || order.status === activeFilter),
    [activeFilter, data.results]
  );
  const isFilterEmpty = total > 0 && filteredOrders.length === 0;

  if (section === 'reviews') {
    return (
      <Stack sx={styles.page}>
        <Stack sx={styles.header}>
          <Stack sx={styles.headerRow}>
            <Typography variant="h2" sx={styles.pageTitle}>
              Değerlendirmelerim
            </Typography>
            {reviews.length > 0 && <Box sx={styles.totalBadge}>{reviews.length}</Box>}
          </Stack>
          <Typography sx={styles.description}>
            Ürünlere yazdığınız değerlendirmeler burada listelenir.
          </Typography>
        </Stack>

        {reviews.length === 0 ? (
          <Stack sx={styles.emptyState}>
            <Box sx={styles.emptyIconBox}>
              <Star size={32} strokeWidth={1.5} color="#8E8E93" />
            </Box>
            <Stack sx={styles.emptyTextBox}>
              <Typography sx={styles.emptyTitle}>Henüz değerlendirme yok</Typography>
              <Typography sx={styles.emptyDescription}>
                Teslim aldığınız ürünler için değerlendirme yazabilirsiniz.
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Stack sx={styles.orderList}>
            {reviews.map((review) => (
              <Stack
                key={review.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  gap: 1,
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={600} fontSize={14}>
                    {review.productName}
                  </Typography>
                  <Stack direction="row" gap={0.5} alignItems="center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? '#F59E0B' : 'none'}
                        color={i < review.rating ? '#F59E0B' : '#D1D5DB'}
                      />
                    ))}
                  </Stack>
                </Stack>
                {review.title && (
                  <Typography fontWeight={500} fontSize={13}>
                    {review.title}
                  </Typography>
                )}
                <Typography fontSize={13} color="text.secondary">
                  {review.text}
                </Typography>
                <Typography fontSize={11} color="text.disabled">
                  {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Stack sx={styles.page}>
      {/* Header */}
      <Stack sx={styles.header}>
        <Stack sx={styles.headerRow}>
          <Typography variant="h2" sx={styles.pageTitle}>
            Siparişlerim
          </Typography>
          {total > 0 && <Box sx={styles.totalBadge}>{total}</Box>}
        </Stack>
        <Typography sx={styles.description}>
          Siparişlerinizi takip edin, detaylarını görüntüleyin.
        </Typography>
      </Stack>

      {/* Filters */}
      {total > 0 && (
        <Stack sx={styles.filtersRow}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            const count = filter.key === 'all' ? total : statusCounts[filter.key];

            return (
              <Box
                key={filter.key}
                component="button"
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                sx={styles.filterPill(isActive)}
              >
                <Typography sx={styles.filterLabel}>{filter.label}</Typography>
                <Box sx={styles.filterBadge(isActive)}>
                  {count}
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Order List */}
      {total ? (
        isFilterEmpty ? (
          <Stack sx={styles.filterEmptyState}>
            <Typography sx={styles.filterEmptyTitle}>
              Bu filtrede sipariş bulunmuyor
            </Typography>
            <Typography sx={styles.filterEmptyDescription}>
              Farklı bir filtre seçerek diğer siparişleri görüntüleyin.
            </Typography>
          </Stack>
        ) : (
          <Stack sx={styles.orderList}>
            {filteredOrders.map((e) => (
              <OrderListItemCard data={e} key={e.id} />
            ))}
          </Stack>
        )
      ) : (
        /* Empty State */
        <Stack sx={styles.emptyState}>
          <Box sx={styles.emptyIconBox}>
            <Package size={32} strokeWidth={1.5} color="#8E8E93" />
          </Box>

          <Stack sx={styles.emptyTextBox}>
            <Typography sx={styles.emptyTitle}>
              Henüz siparişiniz yok
            </Typography>
            <Typography sx={styles.emptyDescription}>
              Siparişleriniz burada listelenecektir. Hemen alışverişe başlayın!
            </Typography>
          </Stack>

          <Button
            variant="contained"
            href="/"
            startIcon={<ShoppingBag size={18} />}
          >
            Alışverişe Başla
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default OrdersPageView;
