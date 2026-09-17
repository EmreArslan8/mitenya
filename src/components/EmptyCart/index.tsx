'use client';

import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck, ShoppingBag, Truck } from '@/components/icons';

interface EmptyCartProps {
  onStartShopping?: () => void;
}

const EmptyCart = ({ onStartShopping }: EmptyCartProps) => {
  const router = useRouter();

  const handleStartShopping = () => {
    if (onStartShopping) {
      onStartShopping();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center gap-8 rounded-3xl border border-tertiary-light bg-bg-light p-8 text-center md:min-h-[550px] md:p-16">
      <div className="relative flex size-[140px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-light)_0%,var(--color-bg)_100%)] shadow-[0_20px_60px_color-mix(in_srgb,var(--color-primary)_12.5%,transparent)] before:absolute before:size-40 before:animate-[spin_20s_linear_infinite] before:rounded-full before:border-2 before:border-dashed before:border-primary/20 after:absolute after:size-[180px] after:rounded-full after:border after:border-primary/10 md:size-[180px] md:before:size-[200px] md:after:size-[220px]">
        <ShoppingBag size={80} className="text-primary" />
      </div>

      <div className="flex max-w-[420px] flex-col gap-3">
        <h2 className="text-[26px] font-bold text-secondary md:text-[32px]">
          Sepetiniz Boş
        </h2>
        <p className="text-sm leading-[1.7] text-tertiary md:text-base">
          Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın ve size özel fırsatları keşfedin!
        </p>
      </div>

      <Button
        variant="contained"
        size="large"
        onClick={handleStartShopping}
        color="primary"
        className="mt-2 min-w-[200px] py-3 text-base md:min-w-60"
      >
        Alışverişe Başla
      </Button>

      <div className="mt-8 flex w-full max-w-[600px] flex-wrap justify-center gap-6 border-t border-tertiary-light pt-8 md:gap-12">
        {[[Truck, '750 TL üzeri', 'ücretsiz kargo'], [RefreshCw, '14 gün', 'kolay iade'], [ShieldCheck, 'Güvenli', 'ödeme']].map(([Icon, first, second]) => (
          <div key={first as string} className="flex flex-[1_1_30%] flex-col items-center gap-2 md:flex-none">
            <span className="flex size-11 items-center justify-center rounded-full bg-success-light"><Icon size={22} className="text-success" /></span>
            <p className="text-[13px] font-medium text-secondary">{first as string}<br />{second as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyCart;
