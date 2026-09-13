'use client';

import { CloseIcon } from '@/components/icons';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from '@/components/common/Link';

interface CookieConsentBannerProps {
  open: boolean;
  collapsed: boolean;
  policyHref: string;
  onAcceptAll: () => void;
  onManage: () => void;
  onDismiss: () => void;
  onReopen: () => void;
}

const CookieConsentBanner = ({
  open,
  collapsed,
  policyHref,
  onAcceptAll,
  onManage,
  onDismiss,
  onReopen,
}: CookieConsentBannerProps) => {
  if (!open) return null;

  if (collapsed) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[1400] px-3 sm:left-4 sm:right-auto sm:bottom-4 sm:px-0 md:left-5">
        <button type="button" className="pointer-events-auto inline-flex size-[52px] items-center justify-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-[0_10px_24px_rgba(28,28,30,0.12)] transition hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(28,28,30,0.16)]" onClick={onReopen} aria-label="Çerez tercihlerini aç">
          <Cookie size={24} strokeWidth={2.1} />
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[1400] px-3 sm:left-4 sm:right-auto sm:bottom-4 sm:px-0 md:left-5">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[390px] flex-col items-stretch rounded-lg border border-gray-100 bg-white px-3 py-3 shadow-[0_12px_32px_rgba(28,28,30,0.1)] sm:mx-0 sm:w-[390px] sm:px-4 sm:py-3.5">
        <div className="flex w-full flex-col gap-[7px]">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-text-medium-light">
              <Cookie size={14} strokeWidth={2.1} />
              <span className="text-[11px] font-bold uppercase leading-none tracking-[0.1em]">
                Çerez Tercihleri
              </span>
            </div>
            <button type="button" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent text-text-medium-light transition hover:bg-bg-dark hover:text-text" onClick={onDismiss} aria-label="Çerez bannerını kapat">
              <CloseIcon size={16} />
            </button>
          </div>

          <p className="text-sm font-medium leading-[1.45] text-text">
            Sizlere daha iyi hizmet sunabilmek, alışveriş deneyiminizi geliştirmek ve ilginizi
            çekebilecek içerikleri gösterebilmek için çerezlerden yararlanıyoruz.
          </p>
          <Link href={policyHref} className="inline-flex text-xs text-text underline underline-offset-3">
            Çerez Politikası
          </Link>

          <div className="mt-[3px] flex w-full flex-nowrap items-center justify-end gap-2.5">
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={onManage}
              className="h-9 min-w-0 px-5 text-xs font-bold tracking-[0.02em]"
            >
              Özelleştir
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={onAcceptAll}
              className="h-9 min-w-[132px] rounded-xl px-5 text-xs font-extrabold tracking-[0.02em]"
            >
              Kabul Et
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
