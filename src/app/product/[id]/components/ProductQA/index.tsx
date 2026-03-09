'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Sparkles } from 'lucide-react';
import useStyles from './styles';
import { ProductQAData } from './ProductQAPanel';

const ProductQAPanel = dynamic(() => import('./ProductQAPanel'), {
  ssr: false,
  loading: () => null,
});

type ProductQAProps = {
  data: ProductQAData;
};

export default function ProductQA({ data }: ProductQAProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  const handleOpenPanel = () => {
    setOpen(true);
  };

  return (
    <>
      {!open && (
        <Box sx={styles.fabDock}>
          <Box
            component="button"
            type="button"
            sx={styles.fab}
            onClick={handleOpenPanel}
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

      {open && <ProductQAPanel data={data} onClose={() => setOpen(false)} />}
    </>
  );
}
