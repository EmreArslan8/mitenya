'use client';

import Button from '@/components/ui/Button';
import ModalCard from '@/components/common/ModalCard';
import { Check } from '@/components/icons';
import { ShopProductData } from '@/lib/api/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AddedToCartModalProps {
  open: boolean;
  onClose: () => void;
  /** Sepete eklenen ürün; seçili varyantlarıyla birlikte. */
  product?: ShopProductData;
}

const AddedToCartModal = ({ open, onClose, product }: AddedToCartModalProps) => {
  const router = useRouter();

  if (!product) return null;

  /** "Renk: Kırmızı" gibi seçili varyant satırları. */
  const selectedVariants =
    product.variants
      ?.map((variant) => {
        const option = variant.options.find((o) => o.selected);
        return option ? { name: variant.name, value: option.value } : null;
      })
      .filter((v): v is { name: string; value: string } => v !== null) ?? [];

  const goToCart = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <ModalCard
      open={open}
      onClose={onClose}
      showCloseIcon
      className="w-full max-w-full sm:w-[708px]"
    >
      <div className="grid grid-cols-1 items-center justify-items-center gap-6 px-2 pb-4 text-left sm:grid-cols-[182px_auto] sm:justify-items-stretch sm:gap-12 sm:px-4">
        <div className="flex h-[255px] w-[182px] max-w-full items-center justify-center overflow-hidden border border-black/[8%] bg-white">
          {product.imgSrc && <Image src={product.imgSrc} alt={product.name ?? 'Ürün'} width={182} height={255} className="block size-full object-cover" />}
        </div>

        <div className="flex w-full min-w-0 flex-col items-start justify-center">
          <div className="mb-4 flex items-center gap-4">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-success bg-bg text-success shadow-[2px_2px_var(--color-text)]">
              <Check size={12} strokeWidth={2.5} />
            </span>
            <h2 className="text-2xl leading-[34px] font-medium tracking-[0.48px] text-success">Ürün sepete eklendi.</h2>
          </div>

          <div className="flex w-full flex-col gap-1">
            {product.brand && <p className="text-base leading-[22px] font-medium tracking-[0.32px]">{product.brand}</p>}
            <p className="text-sm leading-5 tracking-[0.28px]">{product.name}</p>

            {!!selectedVariants.length && (
              <div className="mt-3 flex flex-col gap-1">
                {selectedVariants.map(({ name, value }) => (
                  <p key={name} className="text-sm leading-5 text-text-medium-light">
                    {name}: {value}
                  </p>
                ))}
              </div>
            )}
          </div>

          <Button variant="contained" color="primary" onClick={goToCart} className="mt-8 w-full">
            Sepete Git
          </Button>
        </div>
      </div>
    </ModalCard>
  );
};

export default AddedToCartModal;
