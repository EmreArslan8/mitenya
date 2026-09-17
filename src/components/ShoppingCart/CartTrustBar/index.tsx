import { BadgeCheck, Truck, Undo2 } from '@/components/icons';

/*
 * Sepetin üstündeki güven şeridi.
 *
 * Buradaki üç madde sitede zaten verdiğimiz sözler — yenisini eklemiyoruz:
 *   orijinallik   → ProductFeatures'taki "%100 ORİJİNAL ÜRÜN"
 *   kargo         → ProductInfoSlot'taki "Saat 15:00'e kadar aynı gün kargoda"
 *   iade          → ProductInfoSlot'taki "14 gün içinde kolay iade ve değişim"
 * Metni değiştirirken iade politikası sayfasıyla tutarlı kalmalı.
 */

const ITEMS = [
  {
    Icon: BadgeCheck,
    text: '%100 Orijinal Ürün Garantisi',
  },
  {
    Icon: Truck,
    text: "15:00'e Kadar Siparişte Aynı Gün Kargo",
  },
  {
    Icon: Undo2,
    text: '14 Gün İçinde Koşulsuz İade',
  },
];

const CartTrustBar = () => {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-accentRed-light">
      <div className="mx-auto flex w-full max-w-[1340px] flex-col items-center justify-center gap-2 px-4 py-2.5 md:flex-row md:gap-0">
        {ITEMS.map(({ Icon, text }) => (
          <div key={text} className="flex min-w-0 items-center justify-center gap-2 px-0 text-accentRed md:border-l md:border-accentRed/[18%] md:px-6 md:first:border-l-0">
            <Icon size={16} />
            <span className="truncate text-[13px] leading-[18px] font-medium tracking-[0.24px] text-text">
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartTrustBar;
