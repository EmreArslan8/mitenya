import Button from '@/components/ui/Button';
import Card from '@/components/common/Card';
import Popover from '@/components/ui/Popover';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import { CartBagIcon } from '@/components/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import formatPrice from '@/lib/utils/formatPrice';
import Image from 'next/image';
import { matchesMedia } from '@/theme/breakpoints';

/** Butondan panele geçerken panelin kapanmaması için kısa gecikme. */
const HOVER_CLOSE_DELAY = 160;

const ShoppingCartButton = ({ compact = false }: { compact?: boolean }) => {
  const router = useRouter();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cart, numItems, newProductAdded } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Mobilde sepete ekleme sonrası üstteki mini-sepet popover'ı açılmasın;
    // mobilde alttaki sepet sheet'i (Navigation cartModal) zaten açılıyor.
    if (newProductAdded && matchesMedia('smUp')) setMenuOpen(true);
  }, [newProductAdded]);

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  /** Masaüstünde hover ile açılır; dokunmatikte tıklama tek yol olarak kalır. */
  const handleOpenOnHover = () => {
    if (!matchesMedia('smUp')) return;
    cancelClose();
    setMenuOpen(true);
  };

  const handleCloseOnHover = () => {
    if (!matchesMedia('smUp')) return;
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => setMenuOpen(false), HOVER_CLOSE_DELAY);
  };

  const goToCart = () => {
    cancelClose();
    setMenuOpen(false);
    router.push('/cart');
  };

  /** Boş sepette kullanıcıyı ürün listesine gönderir. */
  const goToShopping = () => {
    cancelClose();
    setMenuOpen(false);
    router.push('/search');
  };

  const hasItems = !!cart?.length;

  return (
    <div>
      <Popover
        open={menuOpen}
        onOpenChange={setMenuOpen}
        align="end"
        sideOffset={0}
        onMouseEnter={cancelClose}
        onMouseLeave={handleCloseOnHover}
        className="border-0 bg-transparent p-4 pt-2 shadow-none"
        trigger={
          <button
            type="button"
            onClick={goToCart}
            onMouseEnter={handleOpenOnHover}
            onMouseLeave={handleCloseOnHover}
            className={
              compact
                ? 'inline-flex size-12 min-w-12 appearance-none items-center justify-center gap-0 border-0 bg-transparent p-0 text-bg-contrast-text [&_svg]:size-7'
                : 'inline-flex appearance-none items-center gap-2 border-0 bg-transparent px-4 py-2 text-bg-contrast-text'
            }
            aria-label={compact ? 'Sepet' : undefined}
          >
            <CartBagIcon size={28} count={isMounted ? numItems : 0} />
            {!compact && 'Sepet'}
          </button>
        }
      >
        <Card className="w-[336px] max-w-screen border border-black/8 bg-bg shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
          <div className="flex flex-col gap-4 p-4">
            {hasItems ? (
              <>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-semibold leading-[1.2] text-text">Sepetim</h2>
                  <span className="text-[13px] font-normal text-text-medium-light">{numItems} Ürün</span>
                </div>

                <div className="flex max-h-[296px] flex-col gap-3.5 overflow-y-auto">
                  {cart?.map((p) => (
                    <Product data={p} key={p.id} />
                  ))}
                </div>

                <Button variant="contained" color="primary" fullWidth onClick={goToCart}>
                  Sepete Git
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-3 text-center">
                <div className="flex size-[76px] items-center justify-center rounded-full bg-bg-dark text-text">
                  <CartBagIcon size={34} />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[15px] font-semibold text-text">Sepetin boş görünüyor</h2>
                  <p className="text-[13px] leading-[18px] text-text-medium-light">
                    Kore cilt bakımının en sevilen ürünlerine göz atmaya ne dersin?
                  </p>
                </div>
                <Button variant="contained" color="primary" fullWidth onClick={goToShopping}>
                  Alışverişe Başla
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Popover>
    </div>
  );
};

const Product = ({ data }: { data: ShopProductData }) => {
  /** "Kırmızı / M / 5 Adet" — seçili varyantlar ve adet tek rozette. */
  const chipParts = [
    ...(data.variants
      ?.map((variant) => variant.options.find((option) => option.selected)?.value)
      .filter((value): value is string => !!value) ?? []),
    `${data.quantity} Adet`,
  ];

  const brand = data.brand;
  const name =
    brand && data.name?.toLocaleLowerCase('tr').startsWith(brand.toLocaleLowerCase('tr'))
      ? data.name.slice(brand.length).trim()
      : data.name;

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-[84px] w-[60px] shrink-0 items-center justify-center overflow-hidden bg-white">
        {data.imgSrc && (
          <Image
            src={data.imgSrc}
            alt={data.name ?? ''}
            width={60}
            height={84}
            className="block size-full object-contain"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <p className="line-clamp-2 text-[13px] leading-[18px] text-text-medium-light [&_b]:font-semibold [&_b]:text-text">
          {brand && <b>{brand} </b>}
          {name}
        </p>
        <span className="flex items-center rounded-full border border-black/[12%] px-2 py-0.5 text-[11px] whitespace-nowrap text-text-medium-light">
          {chipParts.join(' / ')}
        </span>
        <p className="text-sm font-semibold text-text">
          {formatPrice(data.price.currentPrice * data.quantity, data.price.currency)}
        </p>
      </div>
    </div>
  );
};

export default ShoppingCartButton;
