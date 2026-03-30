'use client';

import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { ShopCoupon } from '@/lib/api/types';
import {
  getActiveCoupon,
  hasSeenWelcomeCouponInSession,
  isWelcomeCouponLauncherDismissed,
  isWelcomeCouponLauncherVisible,
  markWelcomeCouponSeenInSession,
  setWelcomeCouponLauncherDismissed,
  setWelcomeCouponLauncherVisible,
  storeWelcomeCoupon,
} from '@/lib/shop/welcomeCoupon';
import copyTextOnClick from '@/lib/utils/copyTextOnClick';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { useEffect, useMemo, useReducer, useState } from 'react';

const OPEN_DELAY_MS = 7000;
const COPY_CLOSE_DELAY_MS = 700;
const SCROLL_TRIGGER_RATIO = 0.25;

export type Phase = 'hidden' | 'modal' | 'launcher';

function phaseReducer(_: Phase, action: 'open' | 'close' | 'reopen' | 'dismiss'): Phase {
  if (action === 'close') return 'launcher';
  if (action === 'dismiss') return 'hidden';
  return 'modal';
}

export type WelcomeCouponHandlers = {
  handleClose: () => void;
  handleCopy: () => Promise<void>;
  handleContinue: () => void;
  handleReopen: () => void;
  handleDismissLauncher: () => void;
};

export type WelcomeCouponState = {
  phase: Phase;
  code: string;
  discountPercent: number;
  snackbarOpen: boolean;
  setSnackbarOpen: (open: boolean) => void;
} & WelcomeCouponHandlers;

export const useWelcomeCoupon = (
  coupons: ShopCoupon[] | null | undefined,
  placement: 'home' | 'product'
): WelcomeCouponState | null => {
  const activeCoupon = useMemo(() => {
    const c = getActiveCoupon(coupons);
    return c?.code ? { ...c, code: c.code.trim().toUpperCase() } : null;
  }, [coupons]);
  const { isReady: isConsentReady, isConsentUiBlocking } = useCookieConsent();

  const [phase, dispatch] = useReducer(phaseReducer, 'hidden');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!activeCoupon?.code || !isConsentReady || isConsentUiBlocking) return;

    const { code } = activeCoupon;
    storeWelcomeCoupon(code);

    if (hasSeenWelcomeCouponInSession(code)) {
      if (isWelcomeCouponLauncherVisible() && !isWelcomeCouponLauncherDismissed()) {
        dispatch('close');
      }
      return;
    }

    let openTimer: number | null = null;
    let hasMetDelay = false;
    let hasMetScroll = false;

    const hasReachedScrollThreshold = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return true;

      return window.scrollY / scrollableHeight >= SCROLL_TRIGGER_RATIO;
    };

    const openCoupon = () => {
      if (openTimer) return;
      openTimer = window.setTimeout(() => {
        dispatch('open');
        markWelcomeCouponSeenInSession(code);
        setWelcomeCouponLauncherVisible(false);
        pushItemToDataLayer({
          event: 'promo_popup_impression',
          promo_location: placement,
          promo_code: code,
          discount_percent: activeCoupon.discountPercent,
        });
      }, 0);
    };

    const tryOpenCoupon = () => {
      if (!hasMetDelay || !hasMetScroll) return;
      window.removeEventListener('scroll', handleScroll);
      openCoupon();
    };

    const handleScroll = () => {
      if (!hasReachedScrollThreshold()) return;
      hasMetScroll = true;
      tryOpenCoupon();
    };

    if (hasReachedScrollThreshold()) {
      hasMetScroll = true;
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    const delayTimer = window.setTimeout(() => {
      hasMetDelay = true;
      tryOpenCoupon();
    }, OPEN_DELAY_MS);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(delayTimer);
      if (openTimer) {
        window.clearTimeout(openTimer);
      }
    };
  }, [activeCoupon, isConsentReady, isConsentUiBlocking, placement]);

  if (!activeCoupon?.code) return null;

  const { code, discountPercent } = activeCoupon;

  const closeModal = () => {
    dispatch('close');
    setWelcomeCouponLauncherVisible(true);
  };

  const handleClose = () => {
    closeModal();
    pushItemToDataLayer({ event: 'promo_popup_close', promo_location: placement, promo_code: code });
  };

  const handleCopy = async () => {
    const copied = await copyTextOnClick(code);
    setSnackbarOpen(copied);

    if (copied) {
      window.setTimeout(closeModal, COPY_CLOSE_DELAY_MS);
    } else {
      closeModal();
    }

    pushItemToDataLayer({ event: 'promo_popup_copy', promo_location: placement, promo_code: code, copied });
  };

  const handleContinue = () => {
    closeModal();
    pushItemToDataLayer({ event: 'promo_popup_cta_click', promo_location: placement, promo_code: code });
  };

  const handleReopen = () => {
    dispatch('reopen');
    markWelcomeCouponSeenInSession(code);
    setWelcomeCouponLauncherVisible(false);
    pushItemToDataLayer({ event: 'promo_popup_reopen', promo_location: placement, promo_code: code });
  };

  const handleDismissLauncher = () => {
    dispatch('dismiss');
    setWelcomeCouponLauncherVisible(false);
    setWelcomeCouponLauncherDismissed(true);
  };

  return {
    phase,
    code,
    discountPercent,
    snackbarOpen,
    setSnackbarOpen,
    handleClose,
    handleCopy,
    handleContinue,
    handleReopen,
    handleDismissLauncher,
  };
};
