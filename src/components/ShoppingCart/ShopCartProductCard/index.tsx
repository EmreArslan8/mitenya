import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Link from '@/components/common/Link';
import ModalCard from '@/components/common/ModalCard';
import QuantitySelector from '@/components/common/QuantitySelector';
import { Heart, TrendingDown } from '@/components/icons';
import { Truck } from 'lucide-react';
import { ShopContext } from '@/contexts/ShopContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CART_MAX_QUANTITY_PER_ITEM } from '@/lib/constants/shop';
import { ShopProductData } from '@/lib/api/types';
import estimatedDeliveryLabel from '@/lib/shop/estimatedDelivery';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { ReactNode, useContext, useState } from 'react';
import useStyles from './styles';

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
  const styles = useStyles();

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
    <Card sx={styles.card(unavailable)}>
      {(data.brand || headerAction) && (
        <Stack sx={styles.brandBar}>
          <Typography sx={styles.brandName}>{data.brand}</Typography>
          {headerAction && <Stack sx={styles.brandBarAction}>{headerAction}</Stack>}
        </Stack>
      )}

      <Stack sx={styles.body}>
        {selection}
        <Link href={unavailable ? null : data.url} onClick={onClick}>
          <Stack sx={styles.imageContainer}>
            <img src={data.imgSrc} alt={data.name} style={styles.image} />
          </Stack>
        </Link>

        <Stack sx={styles.info}>
          <Link href={unavailable ? null : data.url} onClick={onClick}>
            <Typography sx={styles.title}>
              {brand && (
                <Box component="span" sx={styles.titleBrand}>
                  {brand}{' '}
                </Box>
              )}
              {rest}
            </Typography>
          </Link>

          {!unavailable && (
            <Stack sx={styles.delivery} suppressHydrationWarning>
              <Truck size={12} />
              <Typography component="span" sx={styles.deliveryText}>
                Tahmini {deliveryLabel} Kargoda
              </Typography>
            </Stack>
          )}

          {variantLabel && <Typography sx={styles.variants}>{variantLabel}</Typography>}

          {hasDiscount && (
            <Stack sx={styles.campaign}>
              <Typography component="span" sx={styles.campaignText}>
                %{discountPercent} İndirim
              </Typography>
              <Typography component="span" sx={styles.campaignApplied}>
                Uygulandı
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack sx={styles.actions}>
          {editable ? (
            <QuantitySelector
              value={data.quantity}
              max={CART_MAX_QUANTITY_PER_ITEM}
              onIncrease={() => handleIncreaseItemQuantity(data)}
              onDecrease={handleDecrease}
              onChange={(quantity) => handleSetItemQuantity(data, quantity)}
            />
          ) : (
            <Typography sx={styles.variants}>Adet: {data.quantity}</Typography>
          )}

          <Stack sx={styles.priceBlock}>
            <Typography sx={styles.price}>
              {formatPrice(data.price.currentPrice * data.quantity, data.price.currency)}
            </Typography>
            {hasDiscount && (
              <Stack sx={styles.savingChip}>
                <TrendingDown size={14} />
                <Typography component="span" sx={styles.savingText}>
                  {formatPrice(saving, data.price.currency)}
                </Typography>
              </Stack>
            )}
          </Stack>

          {editable && (
            <IconButton
              sx={styles.favoriteButton(favorited)}
              disabled={isFavoriteLoading(data.id)}
              onClick={() => toggleFavorite(data.id)}
              aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Heart size={22} fill={favorited ? 'currentColor' : 'none'} />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <ModalCard
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        showCloseIcon
        CardProps={{ sx: styles.removeModalCard }}
      >
        <Stack sx={styles.removeModal}>
          <Typography sx={styles.removeModalTitle}>
            Bu ürünü sepetinden çıkarmak istediğine emin misin?
          </Typography>
          <Stack sx={styles.removeModalActions}>
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
          </Stack>
        </Stack>
      </ModalCard>
    </Card>
  );
};

export default ShopCartProductCard;
