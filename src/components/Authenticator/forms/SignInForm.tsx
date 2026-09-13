'use client';

import { useFormik } from 'formik';
import { useState } from 'react';
import Banner from '@/components/common/Banner';
import GoogleAuthButton from './GoogleAuthButton';
import PasswordField from '../PasswordField';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

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
    <div className="flex flex-col gap-6">
      <GoogleAuthButton returnUrl={returnUrl} />

      <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit} autoComplete="on">
        <TextField
          name="email"
          label="E-posta adresi"
          type="email"
          autoComplete="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email ? formik.errors.email : undefined}
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

        <button
          type="button"
          onClick={onForgotPassword}
          className="border-0 bg-transparent p-0 text-right text-xs text-text-medium-light underline"
        >
          Şifremi unuttum
        </button>

        <Button loading={loading} variant="contained" type="submit" fullWidth size="large">
          Giriş Yap
        </Button>
      </form>

      {!!error && <Banner variant="error" title={error} />}
    </div>
  );
};

export default SignInForm;
