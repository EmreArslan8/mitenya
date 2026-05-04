'use client';

import { ComponentType } from 'react';
import { CMSBlock } from '@/components/cms/blocks';
import ProductDetailBanner from '@/components/cms/blocks/ProductDetailBanner';
import ProductDetailTabs from '@/components/cms/blocks/ProductDetailTabs';
import ProductDetailIngredients from '@/components/cms/blocks/ProductDetailIngredients';
import ProductDetailClinicalStats from '@/components/cms/blocks/ProductDetailClinicalStats';

const componentMap = {
  'blocks.promo-banner': ProductDetailBanner,
  'blocks.image-accordion': ProductDetailTabs,
  'blocks.ingredient-cards': ProductDetailIngredients,
  'blocks.stats-grid': ProductDetailClinicalStats,
};

const getBlockComponent = (block: CMSBlock, index: number) => {
  const { __component, ...rest } = block;
  const props = rest as unknown as typeof Block extends ComponentType<infer P> ? P : never;
  const Block = componentMap[__component as keyof typeof componentMap];
  return Block ? <Block key={`index-${index}`} {...props} blockIndex={index} /> : null;
};

const ProductPdpBlocks = ({ blocks }: { blocks: CMSBlock[] }) => {
  if (!blocks.length) return null;
  return blocks.map((block, index) => getBlockComponent(block, index));
};

export default ProductPdpBlocks;
