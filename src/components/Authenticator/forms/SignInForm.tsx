'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import { useState } from 'react';
import Banner from '@/components/common/Banner';
import GoogleAuthButton from './GoogleAuthButton';
import PasswordField from '../PasswordField';

interface Props {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  onForgotPassword: () => void;
  /** Google donusunde kullanicinin geri dondurulecegi yol. */
  returnUrl: string;
}

const SignInForm = ({ onSubmit, onForgotPassword, returnUrl }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'E-posta zorunludur';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
        errors.email = 'Geçerli bir e-posta adresi gir';
      if (!values.password) errors.password = 'Şifre zorunludur';
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setError(undefined);
      const ok = await onSubmit(values.email, values.password);
      if (!ok) setError('E-posta veya şifre hatalı');
      setLoading(false);
    },
  });

  return (
    <Stack gap={3}>
      <GoogleAuthButton returnUrl={returnUrl} />

      <Stack component="form" gap={2} onSubmit={formik.handleSubmit} autoComplete="on">
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
          autoComplete="current-password"
          error={formik.touched.password && !!formik.errors.password}
          helperText={formik.touched.password ? formik.errors.password : undefined}
        />

        <Typography
          component="button"
          type="button"
          variant="caption"
          onClick={onForgotPassword}
          sx={{
            p: 0,
            border: 'none',
            background: 'transparent',
            color: 'text.secondary',
            cursor: 'pointer',
            textDecoration: 'underline',
            textAlign: 'right',
          }}
        >
          Şifremi unuttum
        </Typography>

        <LoadingButton loading={loading} variant="contained" type="submit" fullWidth size="large">
          Giriş Yap
        </LoadingButton>
      </Stack>

      {!!error && <Banner variant="error" title={error} />}
    </Stack>
  );
};

export default SignInForm;
