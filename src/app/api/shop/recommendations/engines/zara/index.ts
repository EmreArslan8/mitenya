/*

import 'server-only';
import { RecommendationEngine } from '..';
import bringWithProxy from '../../../utils/bringWithProxy';
import { decrypt } from '../../../utils/crypto';
import { transformResults } from './helpers';

const zaraRecommendationEngine: RecommendationEngine = async ({
  productId: encryptedProductId,
}) => {
  try {
    const pid = decrypt(encryptedProductId).match(/v1=(\d+)[^\d]?/)?.[1];
    const url = `https://www.zara.com/itxrest/1/catalog/store/11766/product/id/${pid}/related/personalized?locale=en_GB&ajax=true&includeRecommendedProducts=true&recommendationModel=google`;
    const [res, err] = await bringWithProxy(url, { next: { revalidate: 1800 } });
    if (err) throw new Error(err.message);
    const filteredResults = res.recommendations
      .filter((e: any) => e.type.toLowerCase() === 'product')
      .filter((e: any) => !e.kind?.toLowerCase().startsWith('frag'))
      .filter((e: any) => !e.kind?.toLowerCase().includes('gift'));
    const products = transformResults(filteredResults);
    return products;
  } catch (error) {
    console.error('recommendation_engine_error', error);
    return [];
  }
};

export default zaraRecommendationEngine;

*/
