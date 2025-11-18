import Card from '@/components/common/Card';
import Link from '@/components/common/Link';
import QuantitySelector from '@/components/common/QuantitySelector';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import { Stack, Typography } from '@mui/material';
import { useContext } from 'react';
import useStyles from './styles';

interface ShopCartProductCardProps {
  data: ShopProductData;
  editable?: boolean;
  unavailable?: boolean;
  onClick?: () => void;
}

const ShopCartProductCard = ({
  data,
  editable = false,
  unavailable = false,
  onClick,
}: ShopCartProductCardProps) => {
  const { handleIncreaseItemQuantity, handleDecreaseItemQuantity } = useContext(ShopContext);
  const styles = useStyles();

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;

  return (
    <Card sx={styles.card(unavailable)}>
      <Link href={unavailable ? null : data.url} onClick={onClick}>
        <Stack sx={styles.imageContainer}>
          <img src={data.imgSrc} alt={data.name} style={styles.image} />
        </Stack>
      </Link>
      <Stack sx={styles.details}>
        <Link href={unavailable ? null : data.url} onClick={onClick}>
          <Stack sx={styles.header}>
            <Typography variant="warningSemibold" sx={styles.title}>
              {data.brand} {data.name}
            </Typography>
            <Typography sx={styles.variants}>
              {data.variants
                ?.flatMap(
                  (v) => ('variants.size') + ': ' + v.options.filter((o) => o.selected)[0]?.value
                )
                .join(', ')}
            </Typography>
          </Stack>
        </Link>
        <Stack sx={styles.qtyPrice}>
          {editable ? (
            <QuantitySelector
              value={data.quantity}
              onIncrease={() => handleIncreaseItemQuantity(data)}
              onDecrease={() => handleDecreaseItemQuantity(data)}
            />
          ) : (
            <Typography sx={styles.variants}>
              {'quantity'}
            </Typography>
          )}
          <Stack alignItems="end">
            {hasDiscount && (
              <Typography variant="infoValue" sx={styles.originalPrice}>
                {(data.price.originalPrice * data.quantity, data.price.currency)}
              </Typography>
            )}
            <Stack direction="row">
              {hasDiscount && <Stack sx={styles.discountBadge}>{`-${discountPercent}%`}</Stack>}
              <Typography variant="infoValue" sx={styles.price}>
                {(data.price.currentPrice * data.quantity, data.price.currency)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ShopCartProductCard;
