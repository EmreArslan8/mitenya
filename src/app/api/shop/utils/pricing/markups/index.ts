import 'server-only';

import { Region } from '@/lib/shop/regions';
import { ProductLike } from '../convertProductPrices';
import { getAggregateMarkup, MarkupConfig } from './helpers';
import { markups as uzMarkups } from './uz';
import { markups as wwMarkups } from './ww';

const getRegionalMarkupConfig = (region: Region): MarkupConfig[] => {
  switch (region) {
    case 'uz':
      return uzMarkups;
    case 'ww':
    default:
      return wwMarkups;
  }
};

const getMarkup = (region: Region, product: ProductLike) => {
  const regionalMarkupConfig = getRegionalMarkupConfig(region);
  return getAggregateMarkup(regionalMarkupConfig, product);
};

export default getMarkup;
