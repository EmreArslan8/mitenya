'use client';

import Icon from '@/components/Icon';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import useStyles from './styles';

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
          <Icon
            name={isFreeShipping ? 'local_shipping' : 'local_shipping'}
            sx={styles.icon(isFreeShipping)}
          />
          <Typography sx={styles.text(isFreeShipping)}>
            {isFreeShipping ? (
              'Ücretsiz kargo kazandınız!'
            ) : (
              <>
                <strong>{remaining.toFixed(2)} {currency}</strong> daha ekleyin, <strong>kargo bedava!</strong>
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
