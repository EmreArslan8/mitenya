import { ShopProductVariantData } from '@/lib/api/types';
import useStyles from './styles';
import CheckButton from '@/components/common/CheckButton';
import { Stack, Divider } from '@mui/material';
import Link from 'next/link';

const ProductVariants = ({
  variants,
  onSelect,
  productId,
}: {
  variants: ShopProductVariantData[];
  onSelect: (variantName: string, optionValue: string) => void;
  productId: string;
}) => {
  const styles = useStyles();

  return variants?.map((v) => (
    <Stack gap={3} key={v.name}>
      <Divider />
      <Stack gap={1}>
        <Stack sx={styles.variantOptions}>
          {v.options.map((option) => {
            const canAcceptOptionId = option.id && productId.split('-').length >= 2;
            return canAcceptOptionId ? (
              <Link
                href={`/product/${productId.split('-').slice(0, 2).join('-')}-${option.id}`}
                key={option.id}
                prefetch={true}
              >
                <CheckButton
                  size="small"
                  value={option.value}
                  selected={option.selected}
                  disabled={!option.isAvailable}
                  sx={styles.variantOption}
                >
                  {option.value}
                </CheckButton>
              </Link>
            ) : (
              <CheckButton
                size="small"
                value={option.value}
                selected={option.selected}
                disabled={!option.isAvailable}
                onClick={() => onSelect(v.name, option.value)}
                sx={styles.variantOption}
                key={option.value}
              >
                {option.value}
              </CheckButton>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  ));
};

export default ProductVariants;
