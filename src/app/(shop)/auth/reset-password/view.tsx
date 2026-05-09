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

const getPasswordUpdateErrorMessage = (message?: string) => {
  if (!message) {
    return 'Şifre güncellenirken hata oluştu. Lütfen tekrar dene.';
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes('same password') ||
    normalized.includes('old password') ||
    normalized.includes('different from the old') ||
    normalized.includes('should be different')
  ) {
    return 'Yeni şifre mevcut şifreyle aynı olamaz.';
  }

  if (
    normalized.includes('weak password') ||
    normalized.includes('password should contain') ||
    normalized.includes('password must contain') ||
    normalized.includes('password is too weak')
  ) {
    return 'Şifre güvenlik kurallarını karşılamıyor. En az 8 karakter, büyük harf, küçük harf ve rakam içeren daha güçlü bir şifre deneyin.';
  }

  if (
    normalized.includes('password') &&
    (normalized.includes('short') || normalized.includes('length') || normalized.includes('characters'))
  ) {
    return 'Şifre en az 8 karakter olmalıdır.';
  }

  if (normalized.includes('password')) {
    return 'Şifre güncellenemedi. Lütfen farklı ve daha güçlü bir şifre deneyin.';
  }

  return 'Şifre güncellenirken hata oluştu. Lütfen tekrar dene.';
};

const clearRecoveryCookie = async () => {
  await fetch('/api/auth/recovery', { method: 'DELETE' });
};

export default function ResetPasswordView({ recoveryAllowed }: { recoveryAllowed: boolean }) {
  const supabase = useSupabase();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [sessionReady, setSessionReady] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const resolveSession = async () => {
      for (let i = 0; i < 5; i += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (mounted) setSessionReady(true);
          return true;
        }
        await wait(250);
      }

      return false;
    };

    const check = async () => {
      if (!recoveryAllowed) {
        setSessionReady(false);
        return;
      }

      const sessionFound = await resolveSession();
      if (sessionFound || !mounted) return;

      await clearRecoveryCookie();
      setError('Şifre sıfırlama linki geçersiz veya süresi dolmuş. Yeni bir link isteyin.');
      setSessionReady(false);
    };

    void check();

    return () => {
      mounted = false;
    };
  }, [recoveryAllowed, supabase]);

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
        console.error('[auth/reset-password] updateUser failed', {
          message: updateError.message,
          status: updateError.status,
          code: updateError.code,
          name: updateError.name,
        });
        setError(getPasswordUpdateErrorMessage(updateError.message));
        return;
      }

      await clearRecoveryCookie();
      await supabase.auth.signOut({ scope: 'others' });

      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    },
  });

  const resetFormValid =
    Boolean(formik.values.password) &&
    Boolean(formik.values.passwordConfirm) &&
    formik.values.password === formik.values.passwordConfirm &&
    !validatePassword(formik.values.password);

  if (sessionReady === undefined) return null;

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
            {sessionReady ? 'Yeni şifre belirle' : 'Şifre sıfırlama linki geçersiz'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!sessionReady
              ? 'Link süresi dolmuş olabilir veya daha önce kullanılmış olabilir. Yeni link isteyerek tekrar deneyin.'
              : success
              ? 'Şifren başarıyla güncellendi. Yönlendiriliyorsun...'
              : 'Hesabın için yeni bir şifre oluştur.'}
          </Typography>
        </Stack>

        {sessionReady && !success && (
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
              disabled={formik.isSubmitting || !resetFormValid}
              variant="contained"
              arrow="end"
              type="submit"
              fullWidth
            >
              Şifremi Güncelle
            </Button>
          </Stack>
        )}

        {sessionReady && success && <Banner variant="success" title="Şifren başarıyla güncellendi!" />}

        {!sessionReady && (
          <Button variant="contained" fullWidth onClick={() => router.push('/')}>
            Ana Sayfaya Dön
          </Button>
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
