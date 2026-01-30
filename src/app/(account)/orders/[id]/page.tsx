import { fetchOrderSupabase } from '@/lib/api/supabaseOrders';
import OrderDetailsPageView from './view';
import { redirect } from 'next/navigation';

const OrderDetailsPage = async ({ params: { id } }: { params: { id: string } }) => {
  const data = await fetchOrderSupabase(id);
  if (!data) return redirect('/orders');
  return <OrderDetailsPageView data={data} />;
};

export const metadata = {
  title: 'Sipariş Detayı',
  description: 'Siparişinizin detaylarını ve durumunu görüntüleyin.',
  robots: { index: false, follow: false },
};

export default OrderDetailsPage;
