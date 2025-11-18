
import { ShopOrderListItemData } from '@/lib/api/types';
import parseDate from '@/lib/utils/parseDate';
import { Grid } from '@mui/material';
import Icon from '../../Icon';
import InfoItem from '../../InfoItem';
import SupportButton from '../../SupportButtonSimple';
import Card from '../../common/Card';
import styles from './styles';
import { useRouter } from 'next/navigation';

const statusColors = {
  processing: 'text',
  preparing: 'text',
  shipped: 'success',
  cancelled: 'error',
};

const OrderListItemCard = ({ data }: { data: ShopOrderListItemData }) => {
  const router = useRouter();
  return (
    <Card border sx={styles.card} onClick={() => router.push(`/orders/${data.id}`)}>
      <Grid container columnSpacing={1} rowSpacing={2} width="100%">
        <Grid item xs={12} sm={2.5} md={2}>
          <InfoItem label={('orders.orderId')} value={data.orderId} />
        </Grid>
        <Grid item xs={12} sm={5.5} md={3}>
          <InfoItem label={('orders.createdDate')} value={parseDate(data.createdDate)} />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <InfoItem
            label={('orders.status')}
            value={(`orders.statuses.${data.status}.label`)}
            slotProps={{ value: { color: statusColors[data.status] } }}
          />
        </Grid>
        {data.status === 'cancelled' && (
          <Grid item xs={12} sm={12} md={5} sx={{ display: 'flex', alignItems: 'center' }}>
            <SupportButton size="small" onClick={(e: any) => e.stopPropagation()} />
          </Grid>
        )}
      </Grid>
      <Icon name="chevron_right" />
    </Card>
  );
};

export default OrderListItemCard;
