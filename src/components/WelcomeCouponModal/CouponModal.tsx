'use client';

import Button from '@/components/common/Button';
import ModalCard from '@/components/common/ModalCard';
import { Box, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import { Copy, X } from 'lucide-react';
import { modalStyles } from './styles';

type Props = {
  open: boolean;
  code: string;
  discountPercent: number;
  snackbarOpen: boolean;
  onClose: () => void;
  onCopy: () => Promise<void>;
  onContinue: () => void;
  onSnackbarClose: () => void;
};

const CouponModal = ({
  open,
  code,
  discountPercent,
  snackbarOpen,
  onClose,
  onCopy,
  onContinue,
  onSnackbarClose,
}: Props) => {
  const s = modalStyles;

  return (
    <>
      <ModalCard
        open={open}
        onClose={onClose}
        noDivider
        disableAutoFocus
        sx={{ alignItems: 'center', justifyContent: 'center', p: { xs: 1, sm: 2 } }}
        CardProps={{ sx: s.modalCard }}
        BodyProps={{ sx: s.modalBody }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} sx={s.modalContent}>
          <IconButton aria-label="Popup'ı kapat" onClick={onClose} sx={s.closeButton}>
            <X size={24} />
          </IconButton>

          <Box sx={s.visualPanel}>
            <Box sx={s.visualOverlay} />
          </Box>

          <Stack sx={s.contentColumn}>
            <Stack sx={s.heroContent}>
              <Typography sx={s.title}>
                İlk siparişinizde
                <br />
                {' '}geçerli %{discountPercent} indirim!
              </Typography>

              <Typography sx={s.subtitle}>
                İlk siparişinize özel indirim kodunuz hazır.
              </Typography>

              <Stack sx={s.couponCard}>
                <Typography sx={s.couponLabel}>İndirim kodunuz</Typography>
                <Typography sx={s.couponCode}>{code}</Typography>
                <IconButton
                  aria-label="İndirim kodunu kopyala"
                  onClick={() => void onCopy()}
                  sx={s.copyButton}
                >
                  <Copy size={16} />
                </IconButton>
              </Stack>
            </Stack>

            <Stack sx={s.actions}>
              <Button variant="contained" fullWidth onClick={onContinue} sx={s.primaryButton}>
                Alışverişe Başla
              </Button>

              <Typography sx={s.footerText}>
                İndirim kodunuz otomatik kaydedildi. Hazır olduğunuzda sepet ekranında
                kullanabilirsiniz. Kampanya yalnızca yeni müşteriler için geçerlidir.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </ModalCard>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2200}
        onClose={onSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Stack sx={s.snackbar}>
          <Typography variant="body2">İndirim kodu kopyalandı ve otomatik kaydedildi.</Typography>
        </Stack>
      </Snackbar>
    </>
  );
};

export default CouponModal;
