'use client';

import { Snackbar, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import Banner from '@/components/common/Banner';
import PasswordField from '@/components/Authenticator/PasswordField';
import { validatePassword } from '@/lib/utils/password';

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  // undefined = kontrol ediliyor, true = geçerli, false = geçersiz
  const [sessionReady, setSessionReady] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/');
        return;
      }
      setSessionReady(true);
    };
    void check();
  }, [supabase, router]);

  const formik = useFormik({
    initialValues: { password: '', passwordConfirm: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      const pwErr = validatePassword(values.password);
      if (pwErr) errors.password = pwErr;
      if (values.password !== values.passwordConfirm) errors.passwordConfirm = 'Şifreler eşleşmiyor';
      return errors;
    },
    onSubmit: async (values) => {
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        setError('Şifre güncellenirken hata oluştu. Lütfen tekrar dene.');
        return;
      }

      // Şifre değişince diğer tüm cihaz/tarayıcılardaki sessionları sonlandır
      await supabase.auth.signOut({ scope: 'others' });

      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    },
  });

  // Session kontrolü bitmeden ya da geçersizse hiçbir şey render etme
  if (!sessionReady) return null;

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      sx={{ backgroundColor: 'background.default' }}
    >
      <Stack
        gap={3}
        sx={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          boxShadow: 1,
        }}
      >
        <Stack gap={0.5}>
          <Typography variant="h2" fontSize={22} fontWeight={700}>
            Yeni şifre belirle
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {success
              ? 'Şifren başarıyla güncellendi. Yönlendiriliyorsun...'
              : 'Hesabın için yeni bir şifre oluştur.'}
          </Typography>
        </Stack>

        {!success && (
          <Stack component="form" gap={2} onSubmit={formik.handleSubmit} autoComplete="on">
            <PasswordField
              name="password"
              label="Yeni Şifre"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && !!formik.errors.password}
              helperText={
                formik.touched.password
                  ? formik.errors.password
                  : 'En az 8 karakter, büyük/küçük harf ve rakam içermeli'
              }
              autoComplete="new-password"
            />
            <PasswordField
              name="passwordConfirm"
              label="Şifre Tekrar"
              value={formik.values.passwordConfirm}
              onChange={formik.handleChange}
              error={formik.touched.passwordConfirm && !!formik.errors.passwordConfirm}
              helperText={formik.touched.passwordConfirm ? formik.errors.passwordConfirm : undefined}
              autoComplete="new-password"
            />

            <Button
              loading={formik.isSubmitting}
              variant="contained"
              arrow="end"
              type="submit"
              fullWidth
            >
              Şifremi Güncelle
            </Button>
          </Stack>
        )}

        {success && (
          <Banner variant="success" title="Şifren başarıyla güncellendi!" />
        )}
      </Stack>

      <Snackbar
        open={!!error}
        onClose={() => setError(undefined)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Banner variant="error" title={error} />
      </Snackbar>
    </Stack>
  );
}
