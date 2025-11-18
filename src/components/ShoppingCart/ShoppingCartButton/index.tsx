import Icon from '@/components/Icon';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import QuantitySelector from '@/components/common/QuantitySelector';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import formatPrice from '@/lib/utils/formatPrice';
import { CircularProgress, MenuItem, Popover, Stack, Typography } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import useStyles from './styles';
import { useRouter } from 'next/navigation';

const ShoppingCartButton = () => {
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
  const styles = useStyles();

  const toggleMenuOpen = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    if (newProductAdded) setMenuOpen(true);
  }, [newProductAdded]);

  return (
    <Stack>
      <MenuItem onClick={toggleMenuOpen} ref={buttonRef} sx={styles.button}>
        <Icon name="shopping_bag" fontSize={24} weight={400} />
         {('cart.button.label', { numItems })}
        {!isCartReady && <CircularProgress color="secondary" size={13} sx={{ mt: '2px' }} />}
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
                  <Typography variant="body"> {('cart.button.title', { numItems })}</Typography>
                  <Icon name="close" onClick={() => setMenuOpen(false)} />
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
                   {('cart.button.continue')}
                </Button>
              </>
            ) : (
              <Stack sx={styles.menuHeader}>
                <Typography variant="body" sx={{ px: 1, pb: 0.5 }}>
                   {('cart.button.shoppingCartEmpty')}
                </Typography>
                <Icon name="close" onClick={() => setMenuOpen(false)} />
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
        {(data.price.currentPrice, data.price.currency)}
      </Typography>
    </Stack>
  );
};

export default ShoppingCartButton;
