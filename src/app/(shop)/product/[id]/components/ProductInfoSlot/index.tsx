import { Truck, Undo2 } from 'lucide-react';
import s from './ProductInfoSlot.module.css';

// RSC (Server Component) — 'use client' YOK. Statik trust kartı + SKT kutusu.
// Sunucuda HTML'e render olur, client'a JS olarak gitmez, hydrate EDİLMEZ.
// view.tsx'teki MUI <Stack/Box/Typography sx=> bloğunun de-MUI + CSS Modules karşılığı.

const ProductInfoSlot = ({ expirationDate }: { expirationDate?: string }) => {
  return (
    <>
      <div className={s.trustCard}>
        <div className={s.trustSignal}>
          <div className={s.trustSignalIcon}>
            <Truck size={18} strokeWidth={2} />
          </div>
          <div className={s.trustSignalContent}>
            <p className={s.trustSignalTitle}>Aynı Gün Kargo</p>
            <p className={s.trustSignalText}>
              {"Saat 15:00'e kadar verilen siparişler aynı gün kargoda."}
            </p>
          </div>
        </div>
        <div className={s.trustSignal}>
          <div className={s.trustSignalIcon}>
            <Undo2 size={18} strokeWidth={2} />
          </div>
          <div className={s.trustSignalContent}>
            <p className={s.trustSignalTitle}>{"Kolay İade & Değişim"}</p>
            <p className={s.trustSignalText}>
              14 gün içinde kolay iade ve değişim imkanı.
            </p>
          </div>
        </div>
      </div>
      {expirationDate ? (
        <div className={s.expirationBox}>
          <p className={s.expirationEyebrow}>Kullanım Bilgisi</p>
          <div className={s.expirationRows}>
            <div className={s.expirationRow}>
              <span className={s.expirationDot} />
              <p className={s.expirationItem}>
                <span className={s.expirationLabel}>Son Kullanma Tarihi:</span>{' '}
                {expirationDate}
              </p>
            </div>
            <div className={s.expirationRow}>
              <span className={s.expirationDot} />
              <p className={s.expirationItem}>
                Açıldıktan sonra <span className={s.expirationLabel}>6 Ay</span> içinde tüketilmesi önerilir.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProductInfoSlot;
