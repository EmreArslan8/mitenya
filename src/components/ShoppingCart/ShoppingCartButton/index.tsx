import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import { CartBagIcon } from '@/components/icons';
import { MenuItem, Popover, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import useStyles from './styles';
import { useRouter } from 'next/navigation';
import formatPrice from '@/lib/utils/formatPrice';
import useScreen from '@/lib/hooks/useScreen';

/** Butondan panele geçerken panelin kapanmaması için kısa gecikme. */
const HOVER_CLOSE_DELAY = 160;

const ShoppingCartButton = ({ compact = false }: { compact?: boolean }) => {
  const router = useRouter();
  const buttonRef = useRef<HTMLLIElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cart, numItems, newProductAdded } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { smDown } = useScreen();
  const styles = useStyles();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Mobilde sepete ekleme sonrası üstteki mini-sepet popover'ı açılmasın;
    // mobilde alttaki sepet sheet'i (Navigation cartModal) zaten açılıyor.
    if (newProductAdded && !smDown) setMenuOpen(true);
  }, [newProductAdded, smDown]);

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  /** Masaüstünde hover ile açılır; dokunmatikte tıklama tek yol olarak kalır. */
  const handleOpenOnHover = () => {
    if (smDown) return;
    cancelClose();
    setMenuOpen(true);
  };

  const handleCloseOnHover = () => {
    if (smDown) return;
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
    <Stack>
      <MenuItem
        ref={buttonRef}
        onClick={goToCart}
        onMouseEnter={handleOpenOnHover}
        onMouseLeave={handleCloseOnHover}
        sx={[styles.button, compact && styles.buttonCompact]}
        aria-label={compact ? 'Sepet' : undefined}
      >
        {/*
          28px bilerek: komsu header ikonlari (Search/User/Heart) 24px.
          Dolu bir govde, ayni kutudaki kontur ikonlarin yaninda optik olarak
          kucuk kaliyor; Boyner'in header setinde de sepet 28px, arama 24px.
        */}
        <CartBagIcon size={28} count={isMounted ? numItems : 0} />
        {!compact && 'Sepet'}
      </MenuItem>

      <Popover
        elevation={0}
        anchorEl={buttonRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableRestoreFocus
        /* Panel hover ile açıldığı için altındaki içeriğin tıklanabilirliğini kapatmıyoruz. */
        sx={{ ...styles.popover, pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: cancelClose,
            onMouseLeave: handleCloseOnHover,
            sx: { pointerEvents: 'auto' },
          },
        }}
      >
        <Card sx={styles.menu}>
          <Stack sx={styles.menuBody}>
            {hasItems ? (
              <>
                <Stack sx={styles.menuHeader}>
                  <Typography sx={styles.menuTitle}>Sepetim</Typography>
                  <Typography sx={styles.menuCount}>{numItems} Ürün</Typography>
                </Stack>

                <Stack sx={styles.products}>
                  {cart?.map((p) => (
                    <Product data={p} key={p.id} />
                  ))}
                </Stack>

                <Button variant="contained" onClick={goToCart} sx={styles.cta}>
                  Sepete Git
                </Button>
              </>
            ) : (
              <Stack sx={styles.empty}>
                <Stack sx={styles.emptyIconRing}>
                  <CartBagIcon size={34} />
                </Stack>
                <Stack gap={0.5}>
                  <Typography sx={styles.emptyTitle}>Sepetin boş görünüyor</Typography>
                  <Typography sx={styles.emptyText}>
                    Kore cilt bakımının en sevilen ürünlerine göz atmaya ne dersin?
                  </Typography>
                </Stack>
                <Button variant="contained" onClick={goToShopping} sx={styles.cta}>
                  Alışverişe Başla
                </Button>
              </Stack>
            )}
          </Stack>
        </Card>
      </Popover>
    </Stack>
  );
};

const Product = ({ data }: { data: ShopProductData }) => {
  const styles = useStyles();

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
    <Stack sx={styles.product}>
      <Stack sx={styles.productImageWrapper}>
        <img src={data.imgSrc} alt={data.name} style={styles.productImage} />
      </Stack>
      <Stack sx={styles.info}>
        <Typography sx={styles.productName}>
          {brand && <b>{brand} </b>}
          {name}
        </Typography>
        <Stack sx={styles.variantChip}>
          <Typography component="span" sx={styles.variantChipText}>
            {chipParts.join(' / ')}
          </Typography>
        </Stack>
        <Typography sx={styles.productPrice}>
          {formatPrice(data.price.currentPrice * data.quantity, data.price.currency)}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ShoppingCartButton;
