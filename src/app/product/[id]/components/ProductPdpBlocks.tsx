'use client';

import BlockManager, { CMSBlock } from '@/components/cms/blocks';

const ProductPdpBlocks = ({ blocks }: { blocks: CMSBlock[] }) => {
  if (!blocks.length) return null;

  return <BlockManager blocks={blocks} />;
};

export default ProductPdpBlocks;
