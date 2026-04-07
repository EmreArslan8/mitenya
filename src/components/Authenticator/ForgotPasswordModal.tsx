'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import Banner from '../common/Banner';
import Button from '../common/Button';
import ModalCard from '../common/ModalCard';

interface Props {
  onClose: () => void;
  onBack: () => void;
  onSubmit: (email: string) => Promise<{ ok: boolean; message?: string }>;
}

const ForgotPasswordModal = ({ onClose, onBack, onSubmit }: Props) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error'>('success');

  const formik = useFormik({
    initialValues: { email: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'E-posta zorunludur';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Geçerli bir e-posta adresi gir';
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setFeedback(null);
      const result = await onSubmit(values.email);
      if (result.ok) {
        setSent(true);
        setFeedbackVariant('success');
        setFeedback(
          result.message ??
            'Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Lütfen gelen kutunu kontrol et.'
        );
      } else {
        setFeedbackVariant('error');
        setFeedback(result.message ?? 'İşlem şu anda tamamlanamadı. Lütfen tekrar dene.');
      }
      setLoading(false);
    },
  });

  return (
    <ModalCard
      title={<Button arrow="start" size="small" onClick={onBack}>Geri</Button>}
      open
      onClose={onClose}
      showCloseIcon
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      CardProps={{ sx: { width: { xs: 'calc(100% - 24px)', sm: 'fit-content' }, maxWidth: { xs: 420, sm: 480 }, borderRadius: 2, mx: 'auto' } }}
    >
      <Stack gap={3}>
        <Stack gap={0.5}>
          <Typography variant="h2" fontSize={22} fontWeight={700}>Şifreni sıfırla</Typography>
          <Typography variant="body2" color="text.secondary">
            {sent
              ? 'Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Lütfen gelen kutunu kontrol et.'
              : 'Hesabına kayıtlı e-posta adresini gir. Sıfırlama bağlantısı gönderilecek.'}
          </Typography>
        </Stack>

        {feedback && <Banner variant={feedbackVariant} title={feedback} />}

        {!sent && (
          <Stack component="form" gap={2} onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              name="email"
              label="E-posta adresi"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && !!formik.errors.email}
              helperText={formik.touched.email && formik.errors.email}
            />
            <Button
              loading={loading}
              disabled={loading || !formik.values.email || !!formik.errors.email}
              variant="contained"
              arrow="end"
              type="submit"
              fullWidth
            >
              Bağlantı Gönder
            </Button>
          </Stack>
        )}

        {sent && (
          <Stack gap={1.5}>
            <Button variant="outlined" fullWidth onClick={onBack}>
              Giriş ekranına dön
            </Button>
            <Button variant="text" fullWidth onClick={onClose}>
              Kapat
            </Button>
          </Stack>
        )}
      </Stack>
    </ModalCard>
  );
};

export default ForgotPasswordModal;
