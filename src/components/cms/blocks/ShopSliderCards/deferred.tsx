'use client';

import dynamic from 'next/dynamic';
import DeferredClientBlock from '../DeferredClientBlock';
import type { ShopSliderCardsProps } from './index';

const LazyShopSliderCards = dynamic(() => import('./index'), { ssr: false });

const DeferredShopSliderCards = (props: ShopSliderCardsProps) => (
  <DeferredClientBlock minHeight="clamp(250px, 34vw, 360px)" rootMargin="500px 0px">
    <LazyShopSliderCards {...props} />
  </DeferredClientBlock>
);

export default DeferredShopSliderCards;
