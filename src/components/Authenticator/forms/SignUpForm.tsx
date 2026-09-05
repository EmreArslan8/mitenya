'use client';

import { Box, Checkbox, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import { useState } from 'react';
import Banner from '@/components/common/Banner';
import GoogleAuthButton from './GoogleAuthButton';
import Link from '@/components/common/Link';
import PasswordField from '../PasswordField';
import { validatePassword } from '@/lib/utils/password';

interface Props {
  onSubmit: (fullName: string, email: string, password: string) => Promise<boolean>;
  /** Google donusunde kullanicinin geri dondurulecegi yol. */
  returnUrl: string;
}

const SignUpForm = ({ onSubmit, returnUrl }: Props) => {
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
      if (!consentAccepted) {
        setConsentError(true);
        return;
      }
      setConsentError(false);
      setLoading(true);
      setError(undefined);
      const ok = await onSubmit(values.fullName, values.email, values.password);
      if (!ok) setError('Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    },
  });

  return (
    <Stack gap={3}>
      <GoogleAuthButton returnUrl={returnUrl} />

      <Stack component="form" gap={2} onSubmit={formik.handleSubmit} autoComplete="on">
        <TextField
          fullWidth
          name="fullName"
          label="Ad Soyad"
          autoComplete="name"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName && !!formik.errors.fullName}
          helperText={formik.touched.fullName && formik.errors.fullName}
        />
        <TextField
          fullWidth
          name="email"
          label="E-posta adresi"
          type="email"
          autoComplete="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && !!formik.errors.email}
          helperText={formik.touched.email && formik.errors.email}
        />
        <PasswordField
          name="password"
          label="Şifre"
          value={formik.values.password}
          onChange={formik.handleChange}
          autoComplete="new-password"
          error={formik.touched.password && !!formik.errors.password}
          helperText={
            formik.touched.password
              ? formik.errors.password
              : 'En az 8 karakter, büyük/küçük harf ve rakam içermeli'
          }
        />
        <PasswordField
          name="passwordConfirm"
          label="Şifre Tekrar"
          value={formik.values.passwordConfirm}
          onChange={formik.handleChange}
          autoComplete="new-password"
          error={formik.touched.passwordConfirm && !!formik.errors.passwordConfirm}
          helperText={formik.touched.passwordConfirm ? formik.errors.passwordConfirm : undefined}
        />

        <Box>
          <Stack direction="row" alignItems="center">
            <Checkbox
              size="small"
              checked={consentAccepted}
              onChange={(e) => {
                setConsentAccepted(e.target.checked);
                if (e.target.checked) setConsentError(false);
              }}
            />
            <Typography variant="body2">
              <Link
                href="/uyelik-ve-kullanim-sartlari"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700 }}
              >
                Üyelik ve Kullanım Şartları
              </Link>{' '}
              ve{' '}
              <Link href="/kvkk" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
                KVKK Aydınlatma Metni
              </Link>{' '}
              metinlerini okudum ve kabul ediyorum
            </Typography>
          </Stack>
          {consentError && (
            <Typography variant="caption" color="error.main">
              Devam etmek için sözleşmeleri kabul etmelisiniz.
            </Typography>
          )}
        </Box>

        <LoadingButton loading={loading} variant="contained" type="submit" fullWidth size="large">
          Hesap Oluştur
        </LoadingButton>
      </Stack>

      {!!error && <Banner variant="error" title={error} />}
    </Stack>
  );
};

export default SignUpForm;
