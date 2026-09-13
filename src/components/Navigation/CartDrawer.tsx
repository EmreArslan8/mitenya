'use client';

import ModalCard from '@/components/common/ModalCard';
import CartPageView from '@/features/cart/CartPageView';

interface CartDrawerProps {
  open: boolean;
  empty: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, empty, onClose }: CartDrawerProps) => (
  <ModalCard
    keepMounted
    open={open}
    onClose={onClose}
    showCloseIcon
    title="Sepet"
    fullWidth={empty}
    className={empty ? 'h-auto max-h-[70vh] pb-4 sm:max-h-[520px]' : 'h-full pb-24'}
    layer={1297}
  >
    <CartPageView
      hideTitle
      visible={open}
      onContinue={onClose}
      onItemClick={onClose}
    />
  </ModalCard>
);

export default CartDrawer;
