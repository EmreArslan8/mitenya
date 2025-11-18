/*
import 'server-only';
import { RecommendationEngine } from '..';
import bringWithProxy from '../../../utils/bringWithProxy';
import { transformPRA10RecommendationResults } from './helpers';
import { decryptNum } from '../../../utils/crypto';

const hmRecommendationEngine: RecommendationEngine = async ({
  productId: encryptedProductId,
}) => {
  try {
    const decryptedPid = decryptNum(encryptedProductId.split('-')[1])
      .toString()
      .padStart(10, '0');
    const url = new URL(`https://www2.hm.com/tr_tr/pra/panel/pra10`);
    const [res, err] = await bringWithProxy(url.toString(), { body: { cart: `${decryptedPid}_tr_tr` }, next: { revalidate: 1800 } });

    if (err) throw new Error(err.message);

    
    const pra10Panel = res.panels.find((panel: any) => panel.attributes.panel_id === 'PRA10');
    if (!pra10Panel) throw new Error('PRA10 panel not found');

    const recommendedProducts = pra10Panel.panels[0].panels[0].products;
    

    // Extract variantData for each recommended product we have
    const productsWithVariants = recommendedProducts.map((product: any) => {
      const { variantData, ...rest } = product;
      
      
      return {
        ...rest,
        variants: variantData,
      };
    });


    const products = transformPRA10RecommendationResults(productsWithVariants);
    return products;
  } catch (error) {
    console.error('recommendation_engine_error', error);
    return [];
  }
};

export default hmRecommendationEngine;

*/
