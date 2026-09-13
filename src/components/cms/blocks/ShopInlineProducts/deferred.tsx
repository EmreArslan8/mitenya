'use client';

import dynamic from 'next/dynamic';
import DeferredClientBlock from '../DeferredClientBlock';
import type { ShopInlineProductsProps } from './index';

const LazyShopInlineProducts = dynamic(() => import('./index'), { ssr: false });

const DeferredShopInlineProducts = (props: ShopInlineProductsProps) => (
  <DeferredClientBlock minHeight="clamp(360px, 48vw, 560px)" rootMargin="500px 0px">
    <LazyShopInlineProducts {...props} />
  </DeferredClientBlock>
);

export default DeferredShopInlineProducts;
