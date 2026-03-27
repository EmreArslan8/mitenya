'use client';

import { Divider, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import Banner from '../common/Banner';
import Button from '../common/Button';
import ModalCard from '../common/ModalCard';
import { TextField } from '@mui/material';
import PasswordField from './PasswordField';

interface Props {
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<boolean>;
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
}

const SignInModal = ({ onClose, onSubmit, onForgotPassword, onSwitchToSignup }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'E-posta zorunludur';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Geçerli bir e-posta adresi gir';
      if (!values.password) errors.password = 'Şifre zorunludur';
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      const ok = await onSubmit(values.email, values.password);
      if (!ok) setError('E-posta veya şifre hatalı');
      setLoading(false);
    },
  });

  const handleGoogleLogin = () => {
    const currentPath = window.location.pathname + window.location.search || '/';
    window.location.href = `/auth/google/login?next=${encodeURIComponent(currentPath)}`;
  };

  return (
    <ModalCard
      title="Giriş Yap"
      open
      onClose={onClose}
      showCloseIcon
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      CardProps={{ sx: { width: { xs: 'calc(100% - 24px)', sm: 'fit-content' }, maxWidth: { xs: 420, sm: 480 }, borderRadius: 2, mx: 'auto' } }}
    >
      <Stack gap={3}>
        <Stack gap={0.5}>
          <Typography variant="h2" fontSize={22} fontWeight={700}>Hesabına giriş yap</Typography>
          <Typography variant="body2" color="text.secondary">
            E-posta ve şifrenle giriş yapabilir veya Google ile devam edebilirsin.
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          onClick={handleGoogleLogin}
          fullWidth
          sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 999, fontWeight: 600, color: 'common.black', backgroundColor: 'common.white', borderColor: 'common.black', '&:hover': { backgroundColor: 'grey.100', borderColor: 'common.black' } }}
        >
          <img width="30" height="30" src="/static/images/socials/google.svg" alt="google-logo" style={{ marginRight: '24px' }} />
          Google ile devam et
        </Button>

        <Stack direction="row" alignItems="center" gap={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">veya</Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        <Stack component="form" gap={2} onSubmit={formik.handleSubmit} autoComplete="on">
          <TextField fullWidth name="email" label="E-posta adresi" type="email" autoComplete="email" value={formik.values.email} onChange={formik.handleChange} error={formik.touched.email && !!formik.errors.email} helperText={formik.touched.email && formik.errors.email} />
          <PasswordField name="password" label="Şifre" value={formik.values.password} onChange={formik.handleChange} autoComplete="current-password" error={formik.touched.password && !!formik.errors.password} helperText={formik.touched.password ? formik.errors.password : undefined} />

          <Typography
            component="button" type="button" variant="caption"
            onClick={onForgotPassword}
            sx={{ p: 0, border: 'none', background: 'transparent', color: 'text.secondary', cursor: 'pointer', textDecoration: 'underline', textAlign: 'right' }}
          >
            Şifremi unuttum
          </Typography>

          <Button loading={loading} variant="contained" arrow="end" type="submit" fullWidth>Giriş Yap</Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Hesabın yok mu?{' '}
          <Typography component="button" type="button" variant="body2" onClick={onSwitchToSignup}
            sx={{ p: 0, m: 0, border: 'none', background: 'transparent', color: 'primary.main', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
          >
            Yeni hesap oluştur
          </Typography>
        </Typography>

        {!!error && <Banner variant="error" title={error} />}
      </Stack>
    </ModalCard>
  );
};

export default SignInModal;
