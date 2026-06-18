'use client';

import { useEffect, useState } from 'react';
import type { CMSBlock } from '@/components/cms/blocks';
import DeferUntilVisible from './DeferUntilVisible';
import ProductPdpBlocks from './ProductPdpBlocks';

/**
 * ADR-0001: PDP CMS blokları (içindekiler/klinik/banner) below-fold ve SEO-kritik
 * DEĞİL (sadece içerik zenginleştirme). Eskiden sunucuda fetch ediliyordu
 * (fetchProductPdpBlocks → /api/cms self-fetch), bu da sayfayı ISR'dan alıkoyuyordu.
 * Artık client'tan, görünürlük kapısı arkasında yükleniyor → sayfa kabuğu ISR olabiliyor
 * ve bloklar her zaman taze gelir.
 */
const PdpBlocksFetcher = ({ slug }: { slug: string }) => {
  const [blocks, setBlocks] = useState<CMSBlock[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/cms/product-pdp?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setBlocks(Array.isArray(data?.blocks) ? data.blocks : []);
      })
      .catch(() => {
        if (active) setBlocks([]);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return blocks?.length ? <ProductPdpBlocks blocks={blocks} /> : null;
};

const ProductPdpBlocksClient = ({ slug }: { slug: string }) => (
  <DeferUntilVisible>
    <PdpBlocksFetcher slug={slug} />
  </DeferUntilVisible>
);

export default ProductPdpBlocksClient;
