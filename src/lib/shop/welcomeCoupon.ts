import { ShopCoupon } from '@/lib/api/types';

export const WELCOME_COUPON_STORAGE_KEY = 'mitenya_welcome_coupon_code';
export const WELCOME_COUPON_LAUNCHER_KEY = 'mitenya_welcome_coupon_launcher';
export const WELCOME_COUPON_LAST_SEEN_CODE_KEY = 'mitenya_welcome_coupon_last_seen_code';
export const WELCOME_COUPON_LAUNCHER_DISMISSED_KEY = 'mitenya_welcome_coupon_launcher_dismissed';

const normalizeDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getActiveCoupon = (coupons?: ShopCoupon[] | null): ShopCoupon | null => {
  if (!coupons?.length) return null;

  const now = Date.now();

  return (
    coupons.find((coupon) => {
      const code = coupon.code?.trim();
      const start = normalizeDate(coupon.startDate);
      const end = normalizeDate(coupon.endDate);

      if (!code || typeof coupon.discountPercent !== 'number' || coupon.discountPercent <= 0) {
        return false;
      }

      if (!start || !end) return false;

      return start.getTime() <= now && end.getTime() >= now;
    }) ?? null
  );
};

export const readStoredWelcomeCoupon = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(WELCOME_COUPON_STORAGE_KEY)?.trim() || null;
};

export const storeWelcomeCoupon = (code: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WELCOME_COUPON_STORAGE_KEY, code.trim().toUpperCase());
};

export const hasSeenWelcomeCouponInSession = (code: string) => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(WELCOME_COUPON_LAST_SEEN_CODE_KEY) === code.trim().toUpperCase();
};

export const markWelcomeCouponSeenInSession = (code: string) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(WELCOME_COUPON_LAST_SEEN_CODE_KEY, code.trim().toUpperCase());
};

export const isWelcomeCouponLauncherVisible = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(WELCOME_COUPON_LAUNCHER_KEY) === '1';
};

export const setWelcomeCouponLauncherVisible = (visible: boolean) => {
  if (typeof window === 'undefined') return;

  if (visible) {
    window.sessionStorage.setItem(WELCOME_COUPON_LAUNCHER_KEY, '1');
    return;
  }

  window.sessionStorage.removeItem(WELCOME_COUPON_LAUNCHER_KEY);
};

export const isWelcomeCouponLauncherDismissed = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(WELCOME_COUPON_LAUNCHER_DISMISSED_KEY) === '1';
};

export const setWelcomeCouponLauncherDismissed = (dismissed: boolean) => {
  if (typeof window === 'undefined') return;

  if (dismissed) {
    window.sessionStorage.setItem(WELCOME_COUPON_LAUNCHER_DISMISSED_KEY, '1');
    return;
  }

  window.sessionStorage.removeItem(WELCOME_COUPON_LAUNCHER_DISMISSED_KEY);
};
