'use client';

import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import useStyles from './styles';
import { Truck } from 'lucide-react';

interface FreeShippingBarProps {
  currentTotal: number;
  threshold?: number;
  currency?: string;
}

const FreeShippingBar = ({
  currentTotal,
  threshold = 750,
  currency = 'TL',
}: FreeShippingBarProps) => {
  const styles = useStyles();

  const remaining = Math.max(0, threshold - currentTotal);
  const progress = Math.min(100, (currentTotal / threshold) * 100);
  const isFreeShipping = currentTotal >= threshold;

  return (
    <Box sx={styles.container(isFreeShipping)}>
      <Stack sx={styles.header}>
        <Stack direction="row" alignItems="center" gap={1}>
          {isFreeShipping ? (
            <Box component="span" sx={styles.celebrate}>🎉</Box>
          ) : (
            <Box component="span" sx={styles.icon(isFreeShipping)}>
              <Truck size={24} />
            </Box>
          )}
          <Typography sx={styles.text(isFreeShipping)}>
            {isFreeShipping ? (
              'Tebrikler, kargo ücretsiz'
            ) : (
              <>
                <strong>{remaining.toFixed(2)} {currency}</strong> daha ekleyin, kargo <strong>ücretsiz</strong>
              </>
            )}
          </Typography>
        </Stack>
        {!isFreeShipping && (
          <Typography sx={styles.thresholdText}>
            {threshold} {currency} üzeri siparişlerde
          </Typography>
        )}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={styles.progressBar(isFreeShipping)}
      />
    </Box>
  );
};

export default FreeShippingBar;
