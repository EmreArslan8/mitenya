'use client';

import { CloseIcon } from '@/components/icons';

type Props = {
  discountPercent: number;
  onReopen: () => void;
  onDismiss: () => void;
};

const CouponLauncher = ({ discountPercent, onReopen, onDismiss }: Props) => {
  return (
    <div className="fixed left-0 bottom-[44%] z-[1301] flex translate-y-1/2 cursor-pointer appearance-none flex-col items-center justify-center gap-2 whitespace-nowrap border border-solid border-primary bg-primary px-2 py-[9.6px] text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] transition-[transform,box-shadow] [writing-mode:vertical-rl] hover:translate-x-0.5 hover:translate-y-1/2 hover:shadow-[0_18px_32px_rgba(0,0,0,0.28)] focus-within:shadow-[0_0_0_3px_rgba(255,220,166,0.95),0_18px_40px_rgba(18,12,7,0.34)] max-sm:bottom-[18px] max-sm:left-2 max-sm:translate-y-0 max-sm:flex-row max-sm:gap-1.5 max-sm:rounded-full max-sm:border-black/[12%] max-sm:bg-secondary max-sm:px-[11.2px] max-sm:py-[7.2px] max-sm:shadow-[0_12px_28px_rgba(17,17,17,0.18)] max-sm:[writing-mode:horizontal-tb] max-sm:hover:-translate-y-0.5 max-sm:hover:translate-x-0 max-sm:hover:shadow-[0_16px_34px_rgba(17,17,17,0.22)] max-sm:focus-within:shadow-[0_0_0_3px_#fff,0_0_0_5px_#3a3a3c]">
      <button
        type="button"
        aria-label="İndirim popup'ını yeniden aç"
        onClick={onReopen}
        className="flex min-w-0 appearance-none items-center justify-center border-0 bg-transparent p-0 text-inherit"
      >
        <span className="flex flex-col items-center gap-[5.2px] max-sm:flex-row max-sm:gap-1.5">
          <span className="text-[11px] font-extrabold leading-none tracking-[0.08em] max-sm:hidden">
            %{discountPercent}
          </span>
          <span className="text-[10px] font-bold uppercase leading-none tracking-[0.08em] max-sm:hidden">
            Size Özel
          </span>
          <span className="hidden text-base font-bold leading-none max-sm:inline">
            İlk siparişinizde geçerli %{discountPercent} indirim!
          </span>
        </span>
      </button>

      <button
        type="button"
        aria-label="Sticky indirimi kapat"
        onClick={onDismiss}
        className="inline-flex appearance-none items-center justify-center border-0 bg-transparent p-0 text-inherit opacity-90 hover:opacity-100 max-sm:size-5 max-sm:p-1"
      >
        <CloseIcon size={12} className="max-sm:hidden" />
        <CloseIcon size={20} className="hidden max-sm:block" />
      </button>
    </div>
  );
};

export default CouponLauncher;
