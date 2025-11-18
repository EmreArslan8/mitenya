import 'server-only';
import { RecommendationEngine } from '..';
import { decryptNum } from '../../../utils/crypto';
import bringWithProxy from '../../../utils/bringWithProxy';
import { transformResults } from './helpers';

const trendyolmillaRecommendationEngine: RecommendationEngine = async ({
  brandId: encryptedBrandId,
  productId: encryptedProductId,
}) => {
  try {
    const webBrandId = decryptNum(encryptedBrandId).toString();
    const pid = decryptNum(encryptedProductId.split('-')[1]).toString();
    const url = new URL(
      `https://apigw.trendyol-milla.com/discovery-web-websfxproductrecommendation-santral/api/v1/product/${pid}/recommendation?size=24&page=0&stamp=TypeA&storefrontId=1&isGoogleBotUser=false&channelId=8`
    );
    url.searchParams.append('webBrandId', webBrandId);
    const [res, err] = await bringWithProxy(url.toString(), { next: { revalidate: 1800 } });
    if (err) throw new Error(err.message);
    const products = transformResults(res.result.content, webBrandId);
    return products;
  } catch (error) {
    console.error('recommendation_engine_error', error);
    return [];
  }
};

export default trendyolmillaRecommendationEngine;
