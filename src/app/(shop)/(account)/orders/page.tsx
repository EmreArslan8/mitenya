import { fetchOrdersSupabase } from '@/lib/api/supabaseOrders';
import { fetchUserReviews } from '@/lib/api/supabaseReviews';
import OrdersPageView from './view';

const EMPTY_ORDERS = { results: [], totalRecordCount: 0, currentPage: 1, pageCount: 1, pageSize: 50 };

const OrdersPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ section?: string }>;
}) => {
  const params = await searchParams;
  const section = params?.section === 'reviews' ? 'reviews' : 'orders';

  if (section === 'reviews') {
    const reviews = await fetchUserReviews();
    return <OrdersPageView section="reviews" data={EMPTY_ORDERS} reviews={reviews} />;
  }

  const data = await fetchOrdersSupabase();
  return <OrdersPageView section="orders" data={data ?? EMPTY_ORDERS} reviews={[]} />;
};

export const metadata = {
  title: 'Siparişlerim',
  description: 'Tüm siparişlerinizi görüntüleyin ve takip edin.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default OrdersPage;
