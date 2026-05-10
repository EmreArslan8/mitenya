import OrderStatusLookupView from './view';

export const metadata = {
  title: 'Sipariş Takip',
  description: 'Misafir siparişinizin güncel durumunu güvenli şekilde takip edin.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const OrderStatusPage = () => <OrderStatusLookupView />;

export default OrderStatusPage;
