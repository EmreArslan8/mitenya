import Card from '@/components/common/Card';
import Link from '@/components/common/Link';
import ModalCard from '@/components/common/ModalCard';
import QuantitySelector from '@/components/common/QuantitySelector';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Heart, TrendingDown, Truck } from '@/components/icons';
import { ShopContext } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CART_MAX_QUANTITY_PER_ITEM } from '@/lib/constants/shop';
import { ShopProductData } from '@/lib/api/types';
import estimatedDeliveryLabel from '@/lib/shop/estimatedDelivery';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import { ReactNode, useContext, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface ShopCartProductCardProps {
  data: ShopProductData;
  editable?: boolean;
  unavailable?: boolean;
  /** Marka şeridinin sağına basılır — ör. kargo bedava eşiği mesajı. */
  headerAction?: ReactNode;
  /** Gövdenin soluna basılır — sepetteki seçim kutusu. */
  selection?: ReactNode;
  onClick?: () => void;
}

/** "Celimax Retinol Serum" + brand "Celimax" → ["Celimax", "Retinol Serum"] */
const splitBrand = (name?: string, brand?: string) => {
  if (!name) return { brand, rest: '' };
  if (!brand) return { brand: undefined, rest: name };
  const lead = name.toLocaleLowerCase('tr').startsWith(brand.toLocaleLowerCase('tr'));
  return lead
    ? { brand, rest: name.slice(brand.length).trim() }
    : { brand, rest: name };
};

const ShopCartProductCard = ({
  data,
  editable = false,
  unavailable = false,
  headerAction,
  selection,
  onClick,
}: ShopCartProductCardProps) => {
  const {
    handleIncreaseItemQuantity,
    handleDecreaseItemQuantity,
    handleSetItemQuantity,
    handleDeleteProduct,
  } = useContext(ShopContext);
  const { openAuthenticator } = useAuth();
  const [removeOpen, setRemoveOpen] = useState(false);
  const [movingToFavorites, setMovingToFavorites] = useState(false);
  const { isFavorite, isFavoriteLoading, toggleFavorite } = useFavorites();

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;
  const saving = (data.price.originalPrice - data.price.currentPrice) * data.quantity;

  const { brand, rest } = splitBrand(data.name, data.brand);
  /** Tahmini kargo günü — ertesi gün, Türkiye saatine göre. */
  const deliveryLabel = estimatedDeliveryLabel();
  const favorited = isFavorite(data.id);

  /** Son adetteki eksi/çöp tuşu doğrudan silmesin — önce onay soralım. */
  const handleDecrease = () => {
    if (data.quantity <= 1) setRemoveOpen(true);
    else handleDecreaseItemQuantity(data);
  };

  const handleRemove = () => {
    setRemoveOpen(false);
    handleDeleteProduct(data);
  };

  const handleMoveToFavorites = async () => {
    // Zaten favorideyse toggle'lamak favoriden çıkarırdı; sadece sepetten alıyoruz.
    if (!favorited) {
      setMovingToFavorites(true);
      const result = await toggleFavorite(data.id);
      setMovingToFavorites(false);
      if (!result.ok) {
        // Giriş gerekiyorsa ürünü sepetten çıkarmıyoruz, yoksa favoriye de gitmeden kaybolur.
        if (result.unauthorized) openAuthenticator?.();
        return;
      }
    }
    handleRemove();
  };

  /** Seçili varyant değerleri: "Kırmızı | M" */
  const variantLabel = data.variants
    ?.map((v) => v.options.find((o) => o.selected)?.value)
    .filter(Boolean)
    .join(' | ');

  return (
    <Card className={cn('w-full gap-0 border border-black/8', unavailable && 'saturate-[0.1] opacity-70')}>
      {(data.brand || headerAction) && (
        <div className="flex items-center justify-between gap-4 border-b border-black/[6%] px-4 py-3">
          <Typography variant="body2" className="max-w-[40%] truncate font-medium uppercase tracking-[0.28px] text-text">
            {data.brand}
          </Typography>
          {headerAction && <div className="flex max-w-[60%] items-center gap-1 whitespace-nowrap text-[12px] leading-4 tracking-[0.24px] text-text-medium-light">{headerAction}</div>}
        </div>
      )}

      <div className="grid grid-cols-[auto_72px_minmax(0,1fr)] items-center gap-x-2 gap-y-3 p-3 sm:flex sm:p-4">
        {selection}
        <Link href={unavailable ? null : data.url} onClick={onClick}>
          <div className="flex h-[110px] w-[72px] max-w-[72px] shrink-0 items-center justify-center overflow-hidden sm:h-[136px] sm:w-[100px] sm:max-w-[100px]">
            <Image
              src={data.imgSrc ?? data.images?.[0] ?? '/static/images/ogBanner.webp'}
              alt={data.name ?? 'Ürün'}
              width={100}
              height={136}
              className="block h-full w-full object-contain"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:ml-4 sm:gap-3">
          <Link href={unavailable ? null : data.url} onClick={onClick}>
            <Typography variant="body2" className="line-clamp-1 tracking-[0.28px] text-text-medium-light">
              {brand && (
                <span className="font-medium uppercase text-text">
                  {brand}{' '}
                </span>
              )}
              {rest}
            </Typography>
          </Link>

          {!unavailable && (
            <div className="-mt-1 flex min-w-0 items-center gap-1 text-text-medium-light" suppressHydrationWarning>
              <Truck size={12} />
              <Typography variant="caption" as="span" className="line-clamp-2 leading-4 tracking-[0.24px] text-text-medium-light sm:line-clamp-1">
                Tahmini {deliveryLabel} Kargoda
              </Typography>
            </div>
          )}

          {variantLabel && <Typography variant="caption" className="leading-4 tracking-[0.24px] text-text-medium-light">{variantLabel}</Typography>}

          {hasDiscount && (
            <div className="flex max-w-full self-start overflow-hidden rounded-[1px] bg-bg-dark px-2 py-1">
              <Typography variant="caption" as="span" className="max-w-[200px] truncate leading-4 tracking-[0.24px] text-text">
                %{discountPercent} İndirim
              </Typography>
              <Typography variant="caption" as="span" className="ml-1 leading-4 tracking-[0.24px] text-success">
                Uygulandı
              </Typography>
            </div>
          )}
        </div>

        <div className="col-start-2 col-end-4 flex min-w-0 shrink-0 items-center justify-between gap-2 sm:ml-7 sm:gap-8">
          {editable ? (
            <QuantitySelector
              value={data.quantity}
              max={CART_MAX_QUANTITY_PER_ITEM}
              onIncrease={() => handleIncreaseItemQuantity(data)}
              onDecrease={handleDecrease}
              onChange={(quantity) => handleSetItemQuantity(data, quantity)}
            />
          ) : (
            <Typography variant="caption" className="leading-4 tracking-[0.24px] text-text-medium-light">Adet: {data.quantity}</Typography>
          )}

          <div className="flex min-w-0 flex-col items-end gap-0.5 sm:w-28">
            <Typography variant="body1" className="whitespace-nowrap font-medium leading-[22px] tracking-[0.32px] text-text">
              {formatPrice(data.price.currentPrice * data.quantity, data.price.currency)}
            </Typography>
            {hasDiscount && (
              <div className="flex items-center gap-1 text-success">
                <TrendingDown size={14} />
                <Typography variant="caption" as="span" className="whitespace-nowrap font-medium leading-4 tracking-[0.24px]">
                  {formatPrice(saving, data.price.currency)}
                </Typography>
              </div>
            )}
          </div>

          {editable && (
            <button
              type="button"
              className={cn('flex h-6 w-6 items-center justify-center border-0 bg-transparent p-0', favorited ? 'text-accentRed' : 'text-text')}
              disabled={isFavoriteLoading(data.id)}
              onClick={() => toggleFavorite(data.id)}
              aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Heart size={22} fill={favorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <ModalCard
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        showCloseIcon
        className="w-full max-w-full sm:w-[420px]"
      >
        <div className="flex flex-col items-center gap-8 px-4 pb-8 pt-2 sm:px-8">
          <Typography variant="h6" className="text-center font-medium leading-7 text-text">
            Bu ürünü sepetinden çıkarmak istediğine emin misin?
          </Typography>
          <div className="flex w-full flex-col gap-3">
            <Button
              variant="contained"
              loading={movingToFavorites}
              onClick={handleMoveToFavorites}
            >
              Çıkar ve favorilerime taşı
            </Button>
            <Button variant="outlined" onClick={handleRemove}>
              Çıkar
            </Button>
          </div>
        </div>
      </ModalCard>
    </Card>
  );
};

export default ShopCartProductCard;
