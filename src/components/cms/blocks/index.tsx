
import { Direction } from '@mui/material';
import { ComponentType } from 'react';
import FAQ from './FAQ';
import FreeText from './FreeText';
import ShopBanner from './ShopBanner';
import ShopFeatureBox from './ShopFeatureBox';
import ShopFeatureCards from './ShopFeatureCards';
import ShopInfoAreas from './ShopInfoAreas';
import ShopInlineProducts from './ShopInlineProducts';
import ShopRibbon from './ShopRibbon';
import ShopBadgeButtons from './ShopBadgeButtons';

/*
 *
 * ███████╗████████╗ ██████╗ ██████╗ ██╗
 * ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║
 * ███████╗   ██║   ██║   ██║██████╔╝██║
 * ╚════██║   ██║   ██║   ██║██╔═══╝ ╚═╝
 * ███████║   ██║   ╚██████╔╝██║     ██╗
 * ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
 *
 * TRYING TO ADD A NEW BLOCK?
 * Add it to the componentMap below. That's all.
 *
 */

const componentMap = {
  'blocks.shop-feature-cards': ShopFeatureCards,
  'blocks.shop-feature-box': ShopFeatureBox,
  'blocks.free-text': FreeText,
  'blocks.faq': FAQ,
  'blocks.shop-banner': ShopBanner,
  'blocks.shop-inline-products': ShopInlineProducts,
  'blocks.shop-info-areas': ShopInfoAreas,
  'blocks.shop-ribbon': ShopRibbon,
  'blocks.shop-badge-button': ShopBadgeButtons,
};

/*
 * ******************************************************
 * ******************************************************
 */

export type CMSBlock = {
  id: number;
  __component: keyof typeof componentMap;
};

/*
 * Defines properties BlockManager PREFERS the component to have.
 * All blocks components MUST extend this interface in their props definition, but are free to ignore the request.
 */
export interface BlockComponentBaseProps {
  blockIndex: number;
  direction: Direction;
}

const getBlockComponent = (block: CMSBlock, index: number) => {
  const { __component, ...rest } = block;
  const props = rest as unknown as typeof Block extends ComponentType<infer P>
    ? P & BlockComponentBaseProps
    : never; // Some ChatGPT blackmagic here
  const Block = componentMap[__component];
  return Block ? <Block key={`index-${index}`} {...props} blockIndex={index} /> : null;
};

const BlockManager = ({ blocks }: { blocks: CMSBlock[] }) => {
  return blocks.map((block, index) => getBlockComponent(block, index));
};

export default BlockManager;
