import CartPageView from './view';

const CartPage = async () => {
  return <CartPageView />;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = {
  title: 'Sepetim',
  description: 'Sepetinizdeki ürünleri görüntüleyin ve satın alma işleminizi tamamlayın.',
};
export default CartPage;
