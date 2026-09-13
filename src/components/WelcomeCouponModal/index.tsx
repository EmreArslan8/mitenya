'use client';

import { ShopCoupon } from '@/lib/api/types';
import CouponLauncher from './CouponLauncher';
import CouponModal from './CouponModal';
import { useWelcomeCoupon } from './useWelcomeCoupon';

/**
 * Hosgeldin kuponu modali gecici olarak kapatildi. Tekrar acmak icin `true` yap;
 * altindaki kupon mantigi (useWelcomeCoupon, CouponModal, CouponLauncher) oldugu
 * gibi duruyor.
 */
const WELCOME_COUPON_ENABLED = false;

const WelcomeCouponModal = ({
  coupons,
  placement,
}: {
  coupons?: ShopCoupon[] | null;
  placement: 'home' | 'product';
}) => {
  const coupon = useWelcomeCoupon(coupons, placement);

  if (!WELCOME_COUPON_ENABLED || !coupon) return null;

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
