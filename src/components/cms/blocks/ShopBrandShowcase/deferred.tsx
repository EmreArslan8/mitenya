'use client';

import dynamic from 'next/dynamic';
import DeferredClientBlock from '../DeferredClientBlock';
import type { ShopBrandShowcaseProps } from './index';

const LazyShopBrandShowcase = dynamic(() => import('./index'), { ssr: false });

const DeferredShopBrandShowcase = (props: ShopBrandShowcaseProps) => (
  <DeferredClientBlock minHeight="clamp(520px, 62vw, 760px)" rootMargin="500px 0px" idleTimeout={1800}>
    <LazyShopBrandShowcase {...props} />
  </DeferredClientBlock>
);

export default DeferredShopBrandShowcase;
