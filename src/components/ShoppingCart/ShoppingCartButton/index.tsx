import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import QuantitySelector from '@/components/common/QuantitySelector';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import { Badge, CircularProgress, MenuItem, Popover, Stack, Typography } from '@mui/material';
import { ShoppingBag, X } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import useStyles from './styles';
import { useRouter } from 'next/navigation';
import formatPrice from '@/lib/utils/formatPrice';

const ShoppingCartButton = ({ compact = false }: { compact?: boolean }) => {
  const router = useRouter();
  const buttonRef = useRef<HTMLLIElement>(null);
  const {
    isCartReady,
    cart,
    numItems,
    handleIncreaseItemQuantity,
    handleDecreaseItemQuantity,
    newProductAdded,
  } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const styles = useStyles();

  const toggleMenuOpen = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (newProductAdded) setMenuOpen(true);
  }, [newProductAdded]);

  return (
    <Stack>
      <MenuItem
        onClick={toggleMenuOpen}
        ref={buttonRef}
        sx={[styles.button, compact && styles.buttonCompact]}
        aria-label={compact ? 'Sepet' : undefined}
      >
        <Badge
          badgeContent={isMounted ? numItems : 0}
          color="error"
          sx={{ '& .MuiBadge-badge': { minWidth: 19, height: 19, fontSize: 11, px: 0.5 } }}
        >
          <ShoppingBag size={23} strokeWidth={2} />
        </Badge>
        {!compact && 'Sepet'}
        {isMounted && !isCartReady && (
          <CircularProgress color="secondary" size={13} sx={{ mt: '2px' }} />
        )}
      </MenuItem>
      <Popover
        elevation={0}
        anchorEl={buttonRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={styles.popover}
      >
        <Card sx={styles.menu}>
          <Stack sx={styles.menuBody}>
            {cart && cart.length > 0 ? (
              <>
                <Stack sx={styles.menuHeader}>
                  <Typography variant="body"> Sepet </Typography>
                  <X size={18} strokeWidth={2} onClick={() => setMenuOpen(false)} />
                </Stack>
                <Stack sx={styles.products}>
                  {cart?.map((p) => (
                    <Product
                      data={p}
                      onQtyDecrease={() => handleDecreaseItemQuantity(p)}
                      onQtyIncrease={() => handleIncreaseItemQuantity(p)}
                      key={p.id}
                    />
                  ))}
                </Stack>
                <Button
                  size="small"
                  variant="tonal"
                  arrow="end"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/cart');
                  }}
                >
             Sepete Git
                </Button>
              </>
            ) : (
              <Stack sx={styles.menuHeader}>
                <Typography variant="body" sx={{ px: 1, pb: 0.5 }}>
                Sepet Boş
                </Typography>
                <X size={18} strokeWidth={2} onClick={() => setMenuOpen(false)} />
              </Stack>
            )}
          </Stack>
        </Card>
      </Popover>
    </Stack>
  );
};

const Product = ({
  data,
  onQtyDecrease,
  onQtyIncrease,
}: {
  data: ShopProductData;
  onQtyDecrease: () => void;
  onQtyIncrease: () => void;
}) => {
  const styles = useStyles();

  const selectedVariantOptions = data.variants
    ?.map((variant) => `(${variant.options.find((option) => option.selected)?.value})`)
    .filter((option) => option !== undefined)
    .join(' ');

  return (
    <Stack sx={styles.product}>
      <img src={data.imgSrc} alt={data.name} style={styles.productImage} />
      <Stack sx={styles.info}>
        <Typography sx={styles.productName}>
          {data.brand} {data.name}
        </Typography>
        <Typography sx={styles.productName}>{selectedVariantOptions}</Typography>
      </Stack>
      {Boolean(data.quantity) && (
        <QuantitySelector
          value={data.quantity}
          onIncrease={onQtyIncrease}
          onDecrease={onQtyDecrease}
          max={5}
          sx={styles.productQuantitySelector}
        />
      )}
      <Typography sx={styles.productPrice}>
        {formatPrice(data.price.currentPrice, data.price.currency)}
      </Typography>
    </Stack>
  );
};

export default ShoppingCartButton;
