'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Sparkles } from 'lucide-react';
import useStyles from './styles';
import type { ShopProductData } from '@/lib/api/types';

const ProductShopAssistantPanel = dynamic(() => import('./ProductShopAssistantPanel'), {
  ssr: false,
  loading: () => null,
});

type ProductShopAssistantProps = {
  data: ShopProductData;
};

const ProductShopAssistant = ({ data }: ProductShopAssistantProps) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <Box sx={styles.fabDock}>
          <Box
            component="button"
            type="button"
            sx={styles.fab}
            onClick={() => setOpen(true)}
            aria-label="Urun hakkinda soru sor"
            id="product-qa-trigger"
          >
            <Box sx={styles.fabIconWrap}>
              <Sparkles size={18} strokeWidth={1.9} />
            </Box>
            <Typography component="span" sx={styles.fabText}>
              Danış
            </Typography>
          </Box>
        </Box>
      )}

      {open && <ProductShopAssistantPanel productId={data.id} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ProductShopAssistant;
