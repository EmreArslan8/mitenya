'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Box, Tooltip, Typography, tooltipClasses } from '@mui/material';
import { MessageCircleQuestion } from 'lucide-react';
import useStyles from './styles';
import { PRODUCT_QA_OPEN_EVENT } from './events';
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

  useEffect(() => {
    const handleOpen = () => setOpen(true);

    window.addEventListener(PRODUCT_QA_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(PRODUCT_QA_OPEN_EVENT, handleOpen);
  }, []);

  return (
    <>
      {!open && (
        <Tooltip
          title="AI urun asistani"
          placement="left"
          arrow
          slotProps={{
            tooltip: {
              sx: styles.fabTooltip,
            },
            arrow: {
              sx: styles.fabTooltipArrow,
            },
            popper: {
              sx: {
                [`& .${tooltipClasses.tooltip}`]: styles.fabTooltip,
              },
            },
          }}
        >
          <Box
            component="button"
            type="button"
            sx={styles.fab}
            onClick={() => setOpen(true)}
            aria-label="Urun hakkinda soru sor"
          >
            <Box sx={styles.fabIconWrap}>
              <MessageCircleQuestion size={18} strokeWidth={1.9} />
            </Box>
            <Box sx={styles.fabTextWrap}>
              <Typography component="span" sx={styles.fabEyebrow}>
                AI
              </Typography>
              <Typography component="span" sx={styles.fabText}>
                Asistan
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      )}

      {open && <ProductQAPanel data={data} onClose={() => setOpen(false)} />}
    </>
  );
}
