

import axios from 'axios';
import { ProductHunter } from '..';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import { encrypt } from '../../../utils/crypto';
import translateQuery from '../../../utils/translateQuery';
import { Currency } from '@/lib/utils/currencies';

const scrapingbeeApiKey = process.env.SCRAPINGBEE_API_KEY;
// FIXME: page index is unused
const watsonsHunter: ProductHunter = async (params: ShopSearchOptions) => {
  console.log('watsonsHunter: ', JSON.stringify(params));
  const { page = 1, category = '', locale, nt } = params;
  let query = params.query ? params.query.toString().replace('watsons', '') : '';
  if (!category && !query) query = 'watsons';

  const requestQuery = `${category} ${query}`; 

  console.log('query: ', query);
  // console.log('translatedQuery: ', translatedQuery); // Artık gerek yok
  console.log('requestQuery (Çevirisiz): ', requestQuery);
  console.log('query: ', query);


  const url = `  https://api.watsons.com.tr/api/v2/wtctr-spa/search?fields=FULL&searchType=PRODUCT&query=${requestQuery}&lang=tr_TR&curr=TRY`;

  try {
    const response = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: { 
        url, 
        api_key: scrapingbeeApiKey, 
        render_js: false, 
        // PREMIUM PROXY DENEMESİ
        premium_proxy: true, // Ekleyin
        
        // EK BAŞLIK DENEMESİ
        custom_headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
      }
      },
    });
    const result = response?.data;
    let products = result.products
      .filter((e: watsonsListItemData) => e.stock.stockLevel > 0)
      .map(transformData)
      .filter((e: ShopProductListItemData | undefined) => e);

    return {
      products,
      totalCount: result.pagination.totalResults,
      tq: 'watsons ' + query,
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

type watsonsListItemData = {
  brands: { name: string }[];
  name: string;
  url: string;
  images: { url: string }[];
  price: { value: number; currencyIso: string };
  stock: { stockLevel: number };
};

const transformData = (data: watsonsListItemData): ShopProductListItemData => {
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

export default watsonsHunter;


