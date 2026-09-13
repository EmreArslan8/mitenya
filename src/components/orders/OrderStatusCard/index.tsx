'use client';

import { ShopOrderStatus } from '@/lib/api/types';
import SupportButton from '../../SupportButtonSimple';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2, Clock, XCircle } from '@/components/icons';
import { PackageCheck, Truck, SquareArrowOutUpRight } from 'lucide-react';
import { ReactNode } from 'react';

/* ── Status pipeline config ── */

const steps: { key: ShopOrderStatus; label: string; icon: ReactNode }[] = [
  { key: 'processing', label: 'Sipariş Alındı', icon: <Clock size={16} strokeWidth={2.2} /> },
  { key: 'preparing', label: 'Hazırlanıyor', icon: <PackageCheck size={16} strokeWidth={2.2} /> },
  { key: 'shipped', label: 'Kargoda', icon: <Truck size={16} strokeWidth={2.2} /> },
  { key: 'delivered', label: 'Teslim Edildi', icon: <CheckCircle2 size={16} strokeWidth={2.2} /> },
];

const statusIndex: Record<ShopOrderStatus, number> = {
  processing: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

const statusDescriptions: Record<ShopOrderStatus, string> = {
  processing: 'Siparişiniz başarıyla alındı ve işleme alınmaktadır.',
  preparing: 'Siparişiniz özenle hazırlanıyor. En kısa sürede kargoya verilecektir.',
  shipped: 'Siparişiniz kargoya verildi! Kargo takip numaranızla sürecini takip edebilirsiniz.',
  delivered: 'Siparişiniz teslim edildi. İyi günlerde kullanın.',
  cancelled: 'Siparişiniz iptal edilmiştir. Detaylı bilgi için destek ekibimizle iletişime geçebilirsiniz.',
};

/* ── Component ── */

const OrderStatusCard = ({
  status,
  trackingNumber,
  orderId,
}: {
  status: ShopOrderStatus;
  trackingNumber?: string;
  orderId: string;
}) => {
  const isCancelled = status === 'cancelled';
  const activeIdx = statusIndex[status];

  return (
    <section className={cn('overflow-hidden rounded-[14px] border sm:rounded-2xl', isCancelled ? 'border-error-light bg-error-light shadow-none' : 'border-gray-100/80 bg-white shadow-[0_10px_30px_rgba(17,24,39,0.06)]')}>
      {/* Header with order number */}
      <div className={cn('flex items-center justify-between border-b px-[18px] py-[11px] sm:px-[22px] sm:py-[13px]', isCancelled ? 'border-error/15' : 'border-gray-100')}>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold uppercase tracking-[0.35px]', isCancelled ? 'text-error-dark' : 'text-text-medium')}>
            Sipariş No
          </span>
          <span className={cn('text-sm font-extrabold tracking-[0.2px] sm:text-[15px]', isCancelled ? 'text-error-dark' : 'text-text')}>
            #{orderId}
          </span>
        </div>
      </div>

      {/* Status content */}
      <div className="flex flex-col gap-[18px] px-[18px] py-[19px] sm:gap-[21px] sm:px-[22px] sm:py-[22px]">
        {/* Cancelled state */}
        {isCancelled ? (
          <div className="flex flex-col items-start gap-[17px]">
            <div className="flex items-center gap-[9px]">
              <XCircle size={20} strokeWidth={2} color="#C1121F" />
              <span className="text-base font-bold text-error sm:text-[17px]">
                İptal Edildi
              </span>
            </div>
            <p className="text-sm font-medium leading-[1.75] text-error-dark">
              {statusDescriptions.cancelled}
            </p>
            <SupportButton size="small" />
          </div>
        ) : (
          <>
            {/* Timeline stepper */}
            <div className="flex w-full items-start">
              {steps.map((step, i) => {
                const isCompleted = i < activeIdx;
                const isActive = i === activeIdx;
                const isPending = i > activeIdx;

                return (
                  <div key={step.key} className="relative flex flex-1 flex-col items-center">
                    {/* Connector line (before the circle) */}
                    {i > 0 && (
                      <span className={cn('absolute right-1/2 top-[15px] h-[1.5px] w-full transition-colors sm:top-4', isCompleted || isActive ? 'bg-gray-300' : 'bg-gray-100')} />
                    )}

                    {/* Step circle */}
                    <span className={cn('relative z-[1] grid size-[30px] place-items-center rounded-full border text-text transition-all sm:size-8', isActive ? 'border-text bg-[#F4F5F7] shadow-[0_0_0_3px_rgba(17,24,39,0.08)]' : isCompleted ? 'border-gray-300 bg-[#F8F9FB]' : 'border-gray-100 bg-[#FCFCFD]')}>
                      {isCompleted ? (
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      ) : (
                        step.icon
                      )}
                    </span>

                    {/* Step label */}
                    <span className={cn('mt-2 text-center text-xs leading-[1.3] sm:mt-[9px]', isActive ? 'font-bold text-text' : isPending ? 'font-medium text-text-disabled' : 'font-medium text-text-medium')}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <p className="text-sm font-medium leading-[1.75] text-text-medium-light">
              {statusDescriptions[status]}
            </p>

            {/* Tracking info for shipped */}
            {status === 'shipped' && trackingNumber && (
              <div className="flex flex-col items-start gap-3 rounded-[10px] border border-gray-100 bg-[#F8FAFC] p-[11px] sm:flex-row sm:items-center sm:p-[13px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.5px] text-text-medium">
                    Takip No:
                  </span>
                  <span className="font-mono text-sm font-bold tracking-[0.5px] text-text">
                    {trackingNumber}
                  </span>
                </div>
                <Button
                  size="small"
                  color="neutral"
                  variant="outlined"
                  href={`https://my.fargo.uz/track?id=${trackingNumber}`}
                  target="_blank"
                  endIcon={<SquareArrowOutUpRight size={14} />}
                  className="border-gray-200 bg-white text-xs normal-case hover:border-text hover:bg-white"
                >
                  Kargoyu Takip Et
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default OrderStatusCard;
