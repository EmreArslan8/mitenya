'use client';

import { ShopProductData } from '@/lib/api/types';
import { Check, CloseIcon } from '@/components/icons';
import { CrossFade } from '@/components/common/CrossFade';
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { useState, useContext, useEffect, useRef } from 'react';
import Button from '@/components/common/Button';
import { ShopContext } from '@/contexts/ShopContext';
import formatPrice from '@/lib/utils/formatPrice';
import useScreen from '@/lib/hooks/useScreen';
import { ShoppingBag } from 'lucide-react';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  product: ShopProductData | null;
  loading?: boolean;
}

const QuickAddModal = ({ open, onClose, product, loading }: QuickAddModalProps) => {
  const { handleAddItem } = useContext(ShopContext);
  const { smUp } = useScreen();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [showAdded, setShowAdded] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Varyantları kontrol et (variants veya attributes'dan)
  const variants = product?.variants;
  const hasVariants = variants && variants.length > 0;

  const handleVariantSelect = (variantName: string, optionValue: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionValue,
    }));
    setError(null);
  };

  const isOptionSelected = (variantName: string, optionValue: string) => {
    return selectedVariants[variantName] === optionValue;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Varyant kontrolü
    if (hasVariants) {
      const allSelected = variants?.every(
        (variant) => selectedVariants[variant.name]
      );

      if (!allSelected) {
        setError('Lütfen tüm seçenekleri belirleyin');
        return;
      }
    }

    // Ürünü varyant bilgileriyle güncelle
    const productToAdd: ShopProductData = {
      ...product,
      quantity: 1,
      variants: hasVariants
        ? variants?.map((variant) => ({
            name: variant.name,
            options: variant.options.map((opt) => ({
              ...opt,
              selected: opt.value === selectedVariants[variant.name],
            })),
          }))
        : undefined,
    };

    const success = handleAddItem(productToAdd);
    if (success) {
      if (smUp) {
        setShowAdded(true);
        if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
        addedTimeoutRef.current = setTimeout(() => handleClose(), 700);
      } else {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    onClose();
    setSelectedVariants({});
    setError(null);
    setShowAdded(false);
  };

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 400,
          width: '100%',
          m: 2,
        },
      }}
    >
      {loading ? (
        <Stack alignItems="center" justifyContent="center" p={4} minHeight={200}>
          <CircularProgress />
          <Typography mt={2} color="text.secondary">
            Yükleniyor...
          </Typography>
        </Stack>
      ) : product ? (
        <Stack>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            borderBottom="1px solid #eee"
          >
            <Typography variant="h6" fontWeight={600}>
              Hızlı Ekle
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Product Info */}
          <Stack direction="row" gap={2} p={2}>
            <Box
              component="img"
              src={product.imgSrc}
              alt={product.name}
              sx={{
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
            <Stack flex={1} justifyContent="center">
              <Typography variant="body2" color="text.secondary">
                {product.brand}
              </Typography>
              <Typography fontWeight={500} sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {product.name}
              </Typography>
              <Typography fontWeight={600} color="primary.main" mt={0.5}>
                {formatPrice(product.price.currentPrice, product.price.currency)}
              </Typography>
            </Stack>
          </Stack>

          {/* Variants */}
          {hasVariants && (
            <Stack p={2} pt={0} gap={2}>
              {variants?.map((variant) => (
                <Stack key={variant.name} gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {variant.name}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {variant.options.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.value}
                        onClick={() => handleVariantSelect(variant.name, option.value)}
                        variant={isOptionSelected(variant.name, option.value) ? 'filled' : 'outlined'}
                        color={isOptionSelected(variant.name, option.value) ? 'primary' : 'default'}
                        disabled={!option.isAvailable}
                        sx={{
                          cursor: option.isAvailable ? 'pointer' : 'not-allowed',
                          opacity: option.isAvailable ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          {/* Error */}
          {error && (
            <Typography color="error" variant="body2" px={2}>
              {error}
            </Typography>
          )}

          {/* Add to Cart Button */}
          <Stack p={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddToCart}
              disabled={showAdded}
            >
              <CrossFade
                components={[
                  {
                    in: showAdded,
                    component: (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Check size={18} />
                        Eklendi
                      </Stack>
                    ),
                  },
                  {
                    in: !showAdded,
                    component: (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <ShoppingBag size={18} />
                        Sepete Ekle
                      </Stack>
                    ),
                  },
                ]}
              />
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Dialog>
  );
};

export default QuickAddModal;
