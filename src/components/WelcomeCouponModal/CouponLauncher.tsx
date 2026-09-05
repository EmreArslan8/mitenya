'use client';

import useScreen from '@/lib/hooks/useScreen';
import { CloseIcon } from '@/components/icons';
import { Box, Stack, Typography } from '@mui/material';
import { useLauncherStyles } from './styles';

type Props = {
  discountPercent: number;
  onReopen: () => void;
  onDismiss: () => void;
};

const CouponLauncher = ({ discountPercent, onReopen, onDismiss }: Props) => {
  const { isMobile } = useScreen();
  const s = useLauncherStyles(isMobile);

  return (
    <Box sx={s.launcher}>
      <Box
        component="button"
        type="button"
        aria-label="İndirim popup'ını yeniden aç"
        onClick={onReopen}
        sx={s.trigger}
      >
        <Stack sx={s.stack}>
          {isMobile ? (
            <Typography sx={s.label}>
              İlk siparişinizde geçerli %{discountPercent} indirim!
            </Typography>
          ) : (
            <>
              <Typography sx={s.percent}>%{discountPercent}</Typography>
              <Typography sx={s.label}>Size Özel</Typography>
            </>
          )}
        </Stack>
      </Box>

      <Box
        component="button"
        type="button"
        aria-label="Sticky indirimi kapat"
        onClick={onDismiss}
        sx={s.dismiss}
      >
        <CloseIcon size={isMobile ? 20 : 12} />
      </Box>
    </Box>
  );
};

export default CouponLauncher;
