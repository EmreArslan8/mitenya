'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import Button from '../common/Button';
import ModalCard from '../common/ModalCard';

interface Props {
  onClose: () => void;
  onBack: () => void;
  onSubmit: (email: string) => Promise<boolean>;
}

const ForgotPasswordModal = ({ onClose, onBack, onSubmit }: Props) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      await onSubmit(values.email);
      setSent(true);
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
            <Button loading={loading} variant="contained" arrow="end" type="submit" fullWidth>
              Bağlantı Gönder
            </Button>
          </Stack>
        )}

        {sent && (
          <Button variant="outlined" fullWidth onClick={onBack}>
            Giriş sayfasına dön
          </Button>
        )}
      </Stack>
    </ModalCard>
  );
};

export default ForgotPasswordModal;
