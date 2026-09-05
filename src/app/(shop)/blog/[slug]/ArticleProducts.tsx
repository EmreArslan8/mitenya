import { Box, Stack, Typography } from '@mui/material';
import Link from '@/components/common/Link';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import type { ShopProductListItemData } from '@/lib/api/types';
import styles from './styles';

const ArticleProducts = ({ products }: { products: ShopProductListItemData[] }) => {
  if (!products.length) return null;

  return (
    <Stack sx={styles.productCard}>
      <Typography sx={styles.sideLabel}>Yazıdaki ürünler</Typography>

      <Stack sx={styles.productList}>
        {products.map((product) => {
          const hasDiscount = product.price.originalPrice > product.price.currentPrice;

          return (
            <Link key={product.id} href={product.url} style={styles.productLink}>
              <Stack sx={styles.productRow}>
                <Box sx={styles.productThumb}>
                  {product.imgSrc && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.imgSrc}
                      srcSet={product.imgSrcSet}
                      sizes="80px"
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      style={styles.productImage}
                    />
                  )}
                  {hasDiscount && (
                    <Box component="span" sx={styles.productBadge}>
                      %{getDiscountPercent(product.price)}
                    </Box>
                  )}
                </Box>

                <Stack sx={styles.productInfo}>
                  <Typography sx={styles.productBrand}>{product.brand}</Typography>
                  <Typography sx={styles.productName}>{product.name}</Typography>
                  <Stack sx={styles.productPriceRow}>
                    <Typography component="span" sx={styles.productPrice}>
                      {formatPrice(product.price.currentPrice, product.price.currency)}
                    </Typography>
                    {hasDiscount && (
                      <Typography component="span" sx={styles.productOldPrice}>
                        {formatPrice(product.price.originalPrice, product.price.currency)}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Link>
          );
        })}
      </Stack>

      <Typography component="a" href="/search" sx={styles.productAllLink}>
        Tüm ürünleri gör
      </Typography>
    </Stack>
  );
};

export default ArticleProducts;
