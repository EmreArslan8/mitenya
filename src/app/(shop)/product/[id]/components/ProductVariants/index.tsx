import { ShopProductVariantData } from '@/lib/api/types';
import CheckButton from '@/components/common/CheckButton';
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
  return variants?.map((v) => (
    <div className="flex flex-col gap-6" key={v.name}>
      <hr className="border-gray-200" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
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
                  selected={option.selected}
                  disabled={!option.isAvailable}
                >
                  {option.value}
                </CheckButton>
              </Link>
            ) : (
              <CheckButton
                size="small"
                selected={option.selected}
                disabled={!option.isAvailable}
                onClick={() => onSelect(v.name, option.value)}
                key={option.value}
              >
                {option.value}
              </CheckButton>
            );
          })}
        </div>
      </div>
    </div>
  ));
};

export default ProductVariants;
