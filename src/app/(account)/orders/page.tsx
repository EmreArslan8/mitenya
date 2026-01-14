import { fetchOrdersSupabase } from '@/lib/api/supabaseOrders';
import OrdersPageView from './view';

const OrdersPage = async () => {
  const data = await fetchOrdersSupabase();
  if (!data) {
    return <OrdersPageView data={{ results: [], totalRecordCount: 0, currentPage: 1, pageCount: 1, pageSize: 50 }} />;
  }
  return <OrdersPageView data={data} />;
};

export const metadata = {
  title: 'Siparişlerim',
  description: 'Tüm siparişlerinizi görüntüleyin ve takip edin.',
};

export const dynamic = 'force-dynamic';

export default OrdersPage;
