'use client';

import dynamic from 'next/dynamic';
import DeferredClientBlock from '../DeferredClientBlock';
import type { ShopBrandsProps } from './index';

const LazyShopBrands = dynamic(() => import('./index'), { ssr: false });

const DeferredShopBrands = (props: ShopBrandsProps) => (
  <DeferredClientBlock minHeight={110} rootMargin="600px 0px" idleTimeout={1800}>
    <LazyShopBrands {...props} />
  </DeferredClientBlock>
);

export default DeferredShopBrands;
