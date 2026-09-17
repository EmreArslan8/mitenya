'use client';

import Button from '@/components/ui/Button';
import { CloseIcon, Copy } from '@/components/icons';
import ModalCard from '@/components/common/ModalCard';
import { Toast } from '@/components/ui/Toast';

type Props = {
  open: boolean;
  code: string;
  discountPercent: number;
  snackbarOpen: boolean;
  onClose: () => void;
  onCopy: () => Promise<void>;
  onContinue: () => void;
  onSnackbarClose: () => void;
};

const CouponModal = ({
  open,
  code,
  discountPercent,
  snackbarOpen,
  onClose,
  onCopy,
  onContinue,
  onSnackbarClose,
}: Props) => {
  return (
    <>
      <ModalCard
        open={open}
        onClose={onClose}
        noDivider
        disableAutoFocus
        layout="center"
        className="max-h-[calc(100dvh-8px)] w-[calc(100vw-8px)] max-w-[calc(100vw-8px)] overflow-hidden rounded-t-[14px] bg-white shadow-[0_28px_90px_rgba(40,30,20,0.22)] sm:max-h-[calc(100dvh-32px)] sm:w-[min(92vw,820px)] sm:rounded-[14px]"
        bodyClassName="p-0"
      >
        <div className="relative flex min-h-0 max-w-full flex-col overflow-hidden md:flex-row">
          <button
            type="button"
            aria-label="Popup'ı kapat"
            onClick={onClose}
            className="absolute right-2 top-2 z-[2] inline-flex size-9 appearance-none items-center justify-center border-0 bg-transparent p-0 text-primary md:right-3 md:top-3"
          >
            <CloseIcon size={24} />
          </button>

          <div className="relative min-h-[124px] shrink-0 basis-auto overflow-hidden bg-[#d8d0c9] [aspect-ratio:2.05/1] sm:min-h-60 sm:[aspect-ratio:auto] md:min-h-[520px] md:basis-[44%]">
            <div
              className="absolute inset-0 bg-cover bg-[center_24%] bg-no-repeat md:hidden"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 100%), url("/static/images/mobile-modal.webp")',
              }}
            />
            <div
              className="absolute inset-0 hidden bg-cover bg-[42%_center] bg-no-repeat md:block"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.16) 100%), url("/static/images/modal.webp")',
              }}
            />
            <div className="absolute inset-0 [background:radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_28%),radial-gradient(circle_at_76%_28%,rgba(255,245,228,0.12)_0%,rgba(255,245,228,0)_22%)]" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 bg-white px-2.5 py-2.5 sm:px-6 sm:py-[22px] md:gap-3 md:px-[26px] md:py-[22.4px]">
            <div className="mt-[7.2px] flex flex-col items-start gap-1.5 text-left md:mt-6 md:gap-3">
              <h2 className="mb-0.5 max-w-[330px] text-[23px] font-bold leading-7 tracking-[-0.05em] text-[#2d3340] [&_br]:hidden sm:text-[30px] sm:leading-[34px] sm:[&_br]:block md:text-[34px] md:leading-[38px]">
                İlk siparişinizde
                <br />
                {' '}geçerli %{discountPercent} indirim!
              </h2>

              <p className="max-w-[390px] text-[13px] font-normal leading-[18px] text-[rgba(35,49,66,0.84)] sm:text-[17px] sm:leading-[23px] md:text-lg md:leading-6">
                İlk siparişinize özel indirim kodunuz hazır.
              </p>

              <div className="relative mt-1 w-full rounded-lg border border-[rgba(35,49,66,0.14)] bg-[#f8fafc] p-[8.8px] pr-11 sm:p-3.5 sm:pr-14 md:mt-1.5">
                <p className="mb-1 text-left text-[11px] text-[rgba(35,49,66,0.56)] sm:mb-1.5 sm:text-xs">
                  İndirim kodunuz
                </p>
                <p className="text-left text-[15px] font-black leading-none tracking-[0.1em] text-[#233142] [overflow-wrap:anywhere] sm:text-[22px] sm:tracking-[0.16em] md:text-2xl">
                  {code}
                </p>
                <button
                  type="button"
                  aria-label="İndirim kodunu kopyala"
                  onClick={() => void onCopy()}
                  className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 appearance-none items-center justify-center border-0 bg-transparent p-0 text-[#233142] hover:bg-[rgba(35,49,66,0.08)] sm:right-3 sm:size-8"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="mt-1.5 flex flex-col gap-[4.8px] md:mt-4 md:gap-2">
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={onContinue}
                className="min-h-[42px] rounded-xl bg-primary text-xs shadow-none hover:bg-primary-dark sm:min-h-[54px] sm:rounded-[14px] sm:text-sm"
              >
                Alışverişe Başla
              </Button>

              <p className="mt-0 self-stretch border-t border-black/[8%] pt-1.5 text-left text-[10.5px] leading-[1.4] text-[rgba(79,88,99,0.84)] sm:pt-3 sm:text-xs sm:leading-[1.55]">
                İndirim kodunuz otomatik kaydedildi. Hazır olduğunuzda sepet ekranında
                kullanabilirsiniz. Kampanya yalnızca yeni müşteriler için geçerlidir.
              </p>
            </div>
          </div>
        </div>
      </ModalCard>

      <Toast
        open={snackbarOpen}
        duration={2200}
        onClose={onSnackbarClose}
        position="top-center"
      >
        <div className="rounded-lg bg-[#1b5e20] px-4 py-2.5 text-white shadow-md">
          <p className="text-sm">İndirim kodu kopyalandı ve otomatik kaydedildi.</p>
        </div>
      </Toast>
    </>
  );
};

export default CouponModal;
