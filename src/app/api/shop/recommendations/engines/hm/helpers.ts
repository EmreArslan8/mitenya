import 'server-only';
import { ShopProductListItemData } from '@/lib/api/types';
import { encryptNum } from '../../../utils/crypto';

type HmPRA10RecommendationItem = {
  variants: VariantData[];
};

type VariantData = {
  varticleCode: string;
  varticleName: string;
  vfashionImage: string;
  vprice: string;
};

const filterPRA10ExcludedProducts = (data: HmPRA10RecommendationItem[]) => {
  return data.filter((e) => e.variants.some((v) => v.vprice !== ''));
};

export const transformPRA10RecommendationResults = (
  results: HmPRA10RecommendationItem[]
): ShopProductListItemData[] => {
  results = filterPRA10ExcludedProducts(results);
  return results.flatMap((e) =>
    e.variants.map((v) => {
      const currentPrice = parseFloat(v.vprice.replace(/\s/g, '').replace('TL', ''));

      return {
        id: `hm-${encryptNum(v.varticleCode)}`,
        name: v.varticleName,
        imgSrc: v.vfashionImage,
        price: {
          originalPrice: currentPrice,
          currentPrice: currentPrice,
          currency: 'TRY',
        },
        brand: 'H&M',
        brandId: 'hm',
        url: `/product/hm-${encryptNum(v.varticleCode)}`,
      };
    })
  );
};
