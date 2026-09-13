'use client';

import Button from '@/components/ui/Button';
import Image from 'next/image';

/**
 * Boş sepet görseli.
 *
 * unDraw'ın "Shopping favorites" illüstrasyonu (açık lisans, atıf gerekmez).
 * İndirildikten sonra üç düzenleme yapıldı, dosya yeniden indirilirse
 * tekrarlanmalı:
 *   1. Mor aksan -> marka kırmızısı #C1121F, koyu lacivertler -> #1C1C1E/#2C2C2E
 *   2. Ten tonu #9f616a -> bej #E3C7A6; tişörtün pembe alt parçası #ed9da0 ->
 *      kırmızının koyu tonu #9E0F1A
 *   3. Kalp, çantanın arkasından taşıyordu; bir <g> ile ölçeklenip çantanın ön
 *      yüzünün ortasına taşındı
 */
const ILLUSTRATION = {
  src: '/static/images/illustrations/shopping-favorites.svg',
  /** Kaynak viewBox — oranı bozmamak için birebir bu değerler. */
  width: 531,
  height: 800,
};

export interface EmptyCartProps {
  /** Sepet drawer/modal içinde daha kompakt görünsün diye. */
  compact?: boolean;
  /** CTA'ya basınca drawer'ı kapatmak gibi ek işler için. */
  onAction?: () => void;
}

const EmptyCart = ({ compact = false, onAction }: EmptyCartProps) => {
  return (
    <div className={`flex flex-col items-center gap-2 px-4 text-center ${compact ? 'py-6 md:py-8' : 'py-10 md:py-[72px]'}`}>
      {/* Genişlik sarmalayıcıda: MUI `Box component={Image}` kalıbı width/height
          prop'larını sistem prop'u sanıp Image'a iletmiyor. */}
      <div className={`w-full ${compact ? 'max-w-[140px] md:max-w-40' : 'max-w-[170px] md:max-w-[220px]'}`}>
        <Image
          src={ILLUSTRATION.src}
          alt=""
          width={ILLUSTRATION.width}
          height={ILLUSTRATION.height}
          aria-hidden
          // Loader zaten SVG'ye dokunmuyor; unoptimized olmadan Next custom
          // loader'in width'i yoksaydigini gorup hata veriyor.
          unoptimized
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      <h2 className="mt-5 text-[22px] leading-tight font-semibold text-text md:mt-8 md:text-[28px]">
        Sepetin boş görünüyor
      </h2>
      <p className="mt-2 max-w-[420px] text-sm leading-normal text-text-medium-light md:text-base">
        Cildinin ihtiyacı olan bakımı keşfetmeye ne dersin?
      </p>
      <Button
        variant="contained"
        href="/"
        onClick={onAction}
        color="primary"
        className="mt-6 min-w-full py-3 sm:min-w-[260px] md:mt-8"
        dataLayerEventId="empty_cart_start_shopping"
      >
        Alışverişe Başla
      </Button>
    </div>
  );
};

export default EmptyCart;
