'use client';

import { Box, Checkbox, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import Banner from '../common/Banner';
import Button from '../common/Button';
import { LoadingButton } from '@mui/lab';
import Link from '../common/Link';
import ModalCard from '../common/ModalCard';
import PasswordField from './PasswordField';
import { validatePassword } from '@/lib/utils/password';

interface Props {
  onClose: () => void;
  onSubmit: (fullName: string, email: string, password: string) => Promise<boolean>;
  onSwitchToSignin: () => void;
}

const SignUpModal = ({ onClose, onSubmit, onSwitchToSignin }: Props) => {
  const [loading, setLoading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const formik = useFormik({
    initialValues: { fullName: '', email: '', password: '', passwordConfirm: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Ad Soyad zorunludur';
      if (!values.email) errors.email = 'E-posta zorunludur';
      const pwErr = validatePassword(values.password);
      if (pwErr) errors.password = pwErr;
      if (values.password !== values.passwordConfirm) errors.passwordConfirm = 'Şifreler eşleşmiyor';
      return errors;
    },
    onSubmit: async (values) => {
      if (!consentAccepted) { setConsentError(true); return; }
      setConsentError(false);
      setLoading(true);
      const ok = await onSubmit(values.fullName, values.email, values.password);
      if (!ok) setError('Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    },
  });

  return (
    <ModalCard
      title="Hesap Oluştur"
      open
      onClose={onClose}
      showCloseIcon
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      CardProps={{ sx: { width: { xs: 'calc(100% - 24px)', sm: 'fit-content' }, maxWidth: { xs: 420, sm: 480 }, borderRadius: 2, mx: 'auto' } }}
    >
      <Stack gap={3}>
        <Stack gap={0.5}>
          <Typography variant="h2" fontSize={22} fontWeight={700}>Yeni hesabını oluştur</Typography>
          <Typography variant="body2" color="text.secondary">Mitenya hesabınla alışverişini daha hızlı tamamla.</Typography>
        </Stack>

        <Stack component="form" gap={2} onSubmit={formik.handleSubmit} autoComplete="on">
          <TextField fullWidth name="fullName" label="Ad Soyad" autoComplete="name" value={formik.values.fullName} onChange={formik.handleChange} error={formik.touched.fullName && !!formik.errors.fullName} helperText={formik.touched.fullName && formik.errors.fullName} />
          <TextField fullWidth name="email" label="E-posta adresi" type="email" autoComplete="email" value={formik.values.email} onChange={formik.handleChange} error={formik.touched.email && !!formik.errors.email} helperText={formik.touched.email && formik.errors.email} />
          <PasswordField
            name="password" label="Şifre" value={formik.values.password} onChange={formik.handleChange} autoComplete="new-password"
            error={formik.touched.password && !!formik.errors.password}
            helperText={formik.touched.password ? formik.errors.password : 'En az 8 karakter, büyük/küçük harf ve rakam içermeli'}
          />
          <PasswordField
            name="passwordConfirm" label="Şifre Tekrar" value={formik.values.passwordConfirm} onChange={formik.handleChange} autoComplete="new-password"
            error={formik.touched.passwordConfirm && !!formik.errors.passwordConfirm}
            helperText={formik.touched.passwordConfirm ? formik.errors.passwordConfirm : undefined}
          />

          <Box>
            <Stack direction="row" alignItems="center">
              <Checkbox size="small" checked={consentAccepted} onChange={(e) => { setConsentAccepted(e.target.checked); if (e.target.checked) setConsentError(false); }} />
              <Typography variant="body2">
                <Link href="/uyelik-ve-kullanim-sartlari" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>Üyelik ve Kullanım Şartları</Link>
                {' '}ve{' '}
                <Link href="/kvkk" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>KVKK Aydınlatma Metni</Link>
                {' '}metinlerini okudum ve kabul ediyorum
              </Typography>
            </Stack>
            {consentError && <Typography variant="caption" color="error.main">Devam etmek için sözleşmeleri kabul etmelisiniz.</Typography>}
          </Box>

          <LoadingButton loading={loading} variant="contained" type="submit" fullWidth>Hesap Oluştur</LoadingButton>
        </Stack>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Zaten hesabın var mı?{' '}
          <Typography component="button" type="button" variant="body2" onClick={onSwitchToSignin}
            sx={{ p: 0, m: 0, border: 'none', background: 'transparent', color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
          >
            Giriş Yap
          </Typography>
        </Typography>

        {!!error && <Banner variant="error" title={error} />}
      </Stack>
    </ModalCard>
  );
};

export default SignUpModal;
