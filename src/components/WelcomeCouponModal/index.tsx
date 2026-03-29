'use client';

import { ShopCoupon } from '@/lib/api/types';
import CouponLauncher from './CouponLauncher';
import CouponModal from './CouponModal';
import { useWelcomeCoupon } from './useWelcomeCoupon';

const WelcomeCouponModal = ({
  coupons,
  placement,
}: {
  coupons?: ShopCoupon[] | null;
  placement: 'home' | 'product';
}) => {
  const coupon = useWelcomeCoupon(coupons, placement);

  if (!coupon) return null;

  const { phase, code, discountPercent, snackbarOpen, setSnackbarOpen,
    handleClose, handleCopy, handleContinue, handleReopen, handleDismissLauncher } = coupon;

  return (
    <>
      <CouponModal
        open={phase === 'modal'}
        code={code}
        discountPercent={discountPercent}
        snackbarOpen={snackbarOpen}
        onClose={handleClose}
        onCopy={handleCopy}
        onContinue={handleContinue}
        onSnackbarClose={() => setSnackbarOpen(false)}
      />
      {phase === 'launcher' && placement === 'home' && (
        <CouponLauncher
          discountPercent={discountPercent}
          onReopen={handleReopen}
          onDismiss={handleDismissLauncher}
        />
      )}
    </>
  );
};

export default WelcomeCouponModal;
