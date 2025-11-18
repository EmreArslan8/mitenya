import 'server-only';
import { ShopProductListItemData } from '@/lib/api/types';
import { encrypt } from '../../../utils/crypto';

type ZaraRecommendationResult = {
  type: string;
  name: string;
  detail: {
    colors: [
      {
        price: number;
        oldPrice: number;
        xmedia: { path: string; name: string; timestamp: string }[];
      }
    ];
  };
  sectionName: string;
  seo: {
    keyword: string;
    seoProductId: string;
    discernProductId: number;
  };
};

export function transformResults(results: ZaraRecommendationResult[]): ShopProductListItemData[] {
  results = results.filter((e) => e.type === 'Product');
  return results
    .map((e) => {
      try {
        const { path, name, timestamp } = e.detail.colors[0].xmedia?.[0] ?? {};
        const id = encrypt(
          'https://zara.com/tr/en/' +
            (e.seo.keyword ?? '') +
            '-p' +
            e.seo.seoProductId +
            '.html?v1=' +
            e.seo.discernProductId
        );
        const product: ShopProductListItemData = {
          id,
          url: `/product/${id}`,
          brand: 'ZARA ' + (e.sectionName?.toUpperCase() ?? ''),
          brandId: '2',
          name: e.name,
          imgSrc: `https://static.zara.net/photos/${path}/w/512/${name}.jpg?ts=${timestamp}`,
          price: {
            currentPrice: e.detail.colors[0].price / 100,
            originalPrice: (e.detail.colors[0].oldPrice ?? e.detail.colors[0].price) / 100,
            currency: 'TRY',
          },
        };
        return product;
      } catch (error) {
        console.log(error);
        console.log('Error trying to add product, skipping: ');
        // console.log(data);
        return undefined;
      }
    })
    .filter(Boolean) as ShopProductListItemData[];
}
