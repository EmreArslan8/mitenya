'use client';

import { Box, Stack, Typography } from '@mui/material';
import { CloseIcon } from '@/components/icons';
import { Cookie } from 'lucide-react';
import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import useStyles from './styles';

interface CookieConsentBannerProps {
  open: boolean;
  collapsed: boolean;
  policyHref: string;
  onAcceptAll: () => void;
  onManage: () => void;
  onDismiss: () => void;
  onReopen: () => void;
}

const CookieConsentBanner = ({
  open,
  collapsed,
  policyHref,
  onAcceptAll,
  onManage,
  onDismiss,
  onReopen,
}: CookieConsentBannerProps) => {
  const styles = useStyles();

  if (!open) return null;

  if (collapsed) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.triggerButton} onClick={onReopen} aria-label="Çerez tercihlerini aç">
          <Cookie size={24} strokeWidth={2.1} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.bar}>
        <Stack sx={styles.content}>
          <Box sx={styles.topBar}>
            <Box sx={styles.eyebrowRow}>
              <Cookie size={14} strokeWidth={2.1} />
              <Typography component="span" sx={styles.eyebrow}>
                Çerez Tercihleri
              </Typography>
            </Box>
            <Box sx={styles.dismissButton} onClick={onDismiss} aria-label="Çerez bannerını kapat">
              <CloseIcon size={16} />
            </Box>
          </Box>

          <Typography component="p" sx={styles.heading}>
            Sizlere daha iyi hizmet sunabilmek, alışveriş deneyiminizi geliştirmek ve ilginizi
            çekebilecek içerikleri gösterebilmek için çerezlerden yararlanıyoruz.
          </Typography>
          <Link href={policyHref} style={styles.policyLink}>
            Çerez Politikası
          </Link>

          <Stack sx={styles.actions}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={onManage}
              sx={styles.customizeButton}
            >
              Özelleştir
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={onAcceptAll}
              sx={styles.acceptButton}
            >
              Kabul Et
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default CookieConsentBanner;
