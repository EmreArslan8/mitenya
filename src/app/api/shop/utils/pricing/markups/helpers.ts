import 'server-only';

import { ProductLike } from '../convertProductPrices';

interface BaseMarkupConfig {
  markup?: { rate?: number; fixed?: number };
  children?: MarkupConfig[];
}

interface BrandMarkupConfig extends BaseMarkupConfig {
  type: 'brand';
  value: string;
}

interface CategoryMarkupConfig extends BaseMarkupConfig {
  type: 'category';
  value: string;
}
interface BreadcrumbFragmentMarkupConfig extends BaseMarkupConfig {
  type: 'breadcrumbFragment';
  value: string;
}

interface PriceRangeMarkupConfig extends BaseMarkupConfig {
  type: 'priceRange';
  value: [number, number];
}

interface DefaultMarkupConfig extends BaseMarkupConfig {
  type: 'default';
  value: 'default';
}

export type MarkupConfig =
  | BrandMarkupConfig
  | CategoryMarkupConfig
  | BreadcrumbFragmentMarkupConfig
  | PriceRangeMarkupConfig
  | DefaultMarkupConfig;

export const getAggregateMarkup = (
  markupConfigs: MarkupConfig[],
  product: ProductLike,
  currentMarkup: { rate: number; fixed: number } = { rate: 0, fixed: 0 }
): { rate: number; fixed: number } => {
  const currentConfig = markupConfigs.find((config) => {
    if (config.type === 'brand') return config.value === product.brand;
    else if (config.type === 'category')
      return config.value?.toString() === product.category?.toString();
    else if (config.type === 'priceRange') {
      const [min, max] = config.value;
      return product.price.originalPrice >= min && product.price.originalPrice <= max;
    } else if (config.type === 'breadcrumbFragment') {
      return product.breadcrumbs?.includes(config.value);
    } else if (config.type === 'default') return true;
    else return false;
  });

  if (!currentConfig) return currentMarkup;

  currentMarkup = {
    rate: currentMarkup.rate + (currentConfig.markup?.rate ?? 0),
    fixed: currentMarkup.fixed + (currentConfig.markup?.fixed ?? 0),
  };

  if (currentConfig.children)
    return getAggregateMarkup(currentConfig.children, product, currentMarkup);

  return currentMarkup;
};
