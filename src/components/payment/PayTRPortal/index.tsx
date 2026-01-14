'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { Box, Modal, Stack, IconButton, Typography } from '@mui/material';
import Icon from '@/components/Icon';
import { useEffect, useState } from 'react';

interface PayTRPortalProps {
  token: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PayTRPortal = ({ token, open, onClose, onSuccess, onError }: PayTRPortalProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !token) return;

    // PayTR iframe mesajlarını dinle
    const handleMessage = (event: MessageEvent) => {
      // PayTR'dan gelen mesajları kontrol et
      if (event.origin !== 'https://www.paytr.com') return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.status === 'success') {
          onSuccess?.();
        } else if (data.status === 'failed' || data.status === 'error') {
          onError?.(data.reason || 'Ödeme başarısız');
        }
      } catch {
        // JSON parse hatası - mesaj PayTR'dan değil
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [open, token, onSuccess, onError]);

  if (!open || !token) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: '90%', md: 600 },
          maxWidth: 600,
          height: { xs: '100%', sm: 'auto' },
          maxHeight: { xs: '100%', sm: '90vh' },
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 2 },
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Icon name="lock" color="success" fontSize={20} />
            <Typography variant="subtitle2" fontWeight={600}>
              Güvenli Ödeme
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <Icon name="close" fontSize={20} />
          </IconButton>
        </Stack>

        {/* PayTR iFrame */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: 400 }}>
          {loading && <LoadingOverlay loading />}
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${token}`}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              border: 'none',
            }}
            onLoad={() => setLoading(false)}
            allow="payment"
          />
        </Box>

        {/* Footer */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1}
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <Icon name="verified_user" color="success" fontSize={16} />
          <Typography variant="caption" color="text.secondary">
            256-bit SSL ile şifrelenmiş güvenli bağlantı
          </Typography>
        </Stack>
      </Box>
    </Modal>
  );
};

export default PayTRPortal;
