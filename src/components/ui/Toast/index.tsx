'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Geçici bildirim — MUI `<Snackbar>` yerine.
 *
 * `'use client'`: otomatik kapanma zamanlayıcısı.
 *
 * API BİLEREK MUI'ye yakın tutuldu (`open` / `duration` / `onClose`): mevcut 8
 * çağrı yeri kendi yerel state'iyle çalışıyor. Merkezî bir toast provider'a
 * geçmek daha temiz olurdu ama bu bir DAVRANIŞ değişikliğidir ve 8 dosyayı
 * birden etkiler — geçiş ortasında yapılmaz (ADR-0002 Faz 2 §F2.9).
 *
 * Erişilebilirlik: `role="status"` + `aria-live="polite"` — MUI Snackbar da
 * bunu yapar; ekran okuyucu bildirimi kesintiye uğratmadan okur.
 */
export type ToastProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** ms. MUI `autoHideDuration` karşılığı; null verilirse otomatik kapanmaz. */
  duration?: number | null;
  position?: 'bottom-center' | 'top-center';
  className?: string;
};

const POSITION = {
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  'top-center': 'top-6 left-1/2 -translate-x-1/2',
} as const;

export function Toast({
  open,
  onClose,
  children,
  duration = 2000,
  position = 'bottom-center',
  className,
}: ToastProps) {
  /*
   * `onClose` ref'te tutuluyor: çağrı yerlerinin hepsi inline arrow veriyor
   * (`onClose={() => setFeedback(null)}`), yani her yeniden render'da kimlik
   * değişiyor. Bağımlılığa konsaydı zamanlayıcı sürekli sıfırlanır ve toast
   * `duration`'dan uzun süre ekranda kalırdı. MUI Snackbar da bunu ref ile
   * çözüyordu (review bulgusu).
   */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || duration === null) return;
    const id = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(id);
  }, [open, duration]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed z-[1500] w-[calc(100vw-32px)] max-w-md',
        'animate-overlay-in',
        POSITION[position],
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Toast;
