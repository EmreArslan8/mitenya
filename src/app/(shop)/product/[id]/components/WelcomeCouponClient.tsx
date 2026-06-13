'use client';

import { useEffect, useState } from 'react';
import WelcomeCouponModal from '@/components/WelcomeCouponModal';
import type { ShopCoupon } from '@/lib/api/types';

/**
 * ADR-0001: Hoşgeldin kupon modalı promosyon amaçlı, SEO-kritik değil. Eskiden
 * sunucuda fetch ediliyordu (fetchShopCouponSet → /api/cms self-fetch), sayfayı
 * ISR'dan alıkoyuyordu. Artık client'tan yükleniyor.
 */
const WelcomeCouponClient = ({
  placement = 'product',
}: {
  placement?: 'home' | 'product';
}) => {
  const [coupons, setCoupons] = useState<ShopCoupon[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/cms/shop-coupon-sets')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.coupons)) setCoupons(data.coupons);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return <WelcomeCouponModal coupons={coupons} placement={placement} />;
};

export default WelcomeCouponClient;
