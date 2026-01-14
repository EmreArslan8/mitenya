import { fetchAddresses } from '@/lib/api/addresses';
import CheckoutPageView from './view';

const CheckoutPage = async () => {
  const res = await fetchAddresses();
  return <CheckoutPageView initialAddresses={res} />;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = {
  title: 'Ödeme',
  description: 'Güvenli ödeme ile siparişinizi tamamlayın.',
};
export default CheckoutPage;
