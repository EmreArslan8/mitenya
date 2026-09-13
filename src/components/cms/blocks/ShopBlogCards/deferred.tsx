'use client';

import dynamic from 'next/dynamic';
import DeferredClientBlock from '../DeferredClientBlock';
import type { ShopBlogCardsProps } from './index';

const LazyShopBlogCards = dynamic(() => import('./index'), { ssr: false });

const DeferredShopBlogCards = (props: ShopBlogCardsProps) => (
  <DeferredClientBlock minHeight="clamp(380px, 48vw, 560px)" rootMargin="500px 0px" idleTimeout={1800}>
    <LazyShopBlogCards {...props} />
  </DeferredClientBlock>
);

export default DeferredShopBlogCards;
