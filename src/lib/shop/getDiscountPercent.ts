import { ShopProductPrice } from '../api/types';
import clamp from '../utils/clamp';

const getDiscountPercent = (price: ShopProductPrice) => {
  return clamp(
    1,
    Math.floor(((price.originalPrice - price.currentPrice) / price.originalPrice) * 100),
    100
  );
};

export default getDiscountPercent;
