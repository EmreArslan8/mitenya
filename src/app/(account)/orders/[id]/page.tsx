import { fetchOrderSupabase } from '@/lib/api/supabaseOrders';
import OrderDetailsPageView from './view';

const OrderDetailsPage = async ({ params: { id } }: { params: { id: string } }) => {
  const data = await fetchOrderSupabase(id);
  if (!data) throw new Error('error.orders.details');
  return <OrderDetailsPageView data={data} />;
};

export const metadata = {
  title: 'Sipariş Detayı',
  description: 'Siparişinizin detaylarını ve durumunu görüntüleyin.',
};

export default OrderDetailsPage;
