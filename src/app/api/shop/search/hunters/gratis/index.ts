import axios from 'axios';
import { ProductHunter } from '..';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import { encrypt } from '../../../utils/crypto';
import translateQuery from '../../../utils/translateQuery';
import { Currency } from '@/lib/utils/currencies';

const scrapingbeeApiKey = process.env.SCRAPINGBEE_API_KEY;
// FIXME: page index is unused
const gratisHunter: ProductHunter = async (params: ShopSearchOptions) => {
  console.log('gratisHunter: ', JSON.stringify(params));
  const { page = 1, category = '', locale, nt } = params;
  let query = params.query ? params.query.toString().replace('gratis', '') : '';
  if (!category && !query) query = 'gratis';

  const requestQuery = `${category}`;

  console.log('query: ', query);
  console.log('requestQuery: ', requestQuery);

  const url = `https://api.cn94v1klbw-gratisicv1-p1-public.model-t.cc.commerce.ondemand.com/gratiscommercewebservices/v2/gratis/products/search?query=${requestQuery}`;

  try {
    const response = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: { url, api_key: scrapingbeeApiKey, render_js: false },
    });
    const result = response?.data;
    let products = result.products
      .filter((e: GratisListItemData) => e.stock.stockLevel > 0)
      .map(transformData)
      .filter((e: ShopProductListItemData | undefined) => e);

    return {
      products,
      totalCount: result.pagination.totalResults,
      tq: 'gratis ' + requestQuery,
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

type GratisListItemData = {
  brands: { name: string }[];
  name: string;
  url: string;
  images: { url: string }[];
  price: { value: number; currencyIso: string };
  stock: { stockLevel: number };
};

const transformData = (data: GratisListItemData): ShopProductListItemData => {
  const id = encrypt(data.url);
  return {
    id,
    url: `/product/${id}`,
    brand: data.brands[0]?.name || '',
    brandId: '',
    name: data.name,
    imgSrc: data.images[0]?.url?.replace('300/300', '900/900') || '',
    price: {
      currentPrice: data.price.value,
      originalPrice: data.price.value,
      currency: data.price.currencyIso as Currency,
    },
  };
};

export default gratisHunter;
