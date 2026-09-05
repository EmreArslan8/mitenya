'use client';

import { Snackbar, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Banner from '@/components/common/Banner';
import Link from '@/components/common/Link';
import ForgotPasswordForm from '@/components/Authenticator/forms/ForgotPasswordForm';
import SignInForm from '@/components/Authenticator/forms/SignInForm';
import SignUpForm from '@/components/Authenticator/forms/SignUpForm';
import VerificationForm from '@/components/Authenticator/forms/VerificationForm';
import useAuthActions from '@/components/Authenticator/useAuthActions';
import Showcase from './Showcase';
import { useAuth } from '@/contexts/AuthContext';
import useStyles from './styles';

type Step = 'signin' | 'signup' | 'verification' | 'forgot-password';

/** Open redirect onlemi: sadece kendi sitemizdeki mutlak yollara donulur. */
const sanitizeReturnUrl = (value: string | null) => {
  if (!value) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
};

const UyelikView = () => {
  const styles = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const returnUrl = sanitizeReturnUrl(searchParams.get('returnUrl'));
  const initialStep: Step = searchParams.get('type') === 'uye-ol' ? 'signup' : 'signin';

  const [step, setStep] = useState<Step>(initialStep);
  const {
    error,
    setError,
    signupEmail,
    signIn,
    signUp,
    verify,
    resendVerification,
    forgotPassword,
  } = useAuthActions();

  // Zaten girisli kullanici bu sayfada bekletilmez.
  useEffect(() => {
    if (isAuthenticated) router.replace(returnUrl);
  }, [isAuthenticated, returnUrl, router]);

  const goBack = useCallback(() => {
    router.replace(returnUrl);
  }, [returnUrl, router]);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      const ok = await signIn(email, password);
      if (ok) goBack();
      return ok;
    },
    [goBack, signIn]
  );

  const handleSignUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const ok = await signUp(fullName, email, password);
      if (ok) setStep('verification');
      return ok;
    },
    [signUp]
  );

  const handleVerify = useCallback(
    async (code: string) => {
      const ok = await verify(code);
      if (ok) goBack();
      return ok;
    },
    [goBack, verify]
  );

  const copy = useMemo(() => {
    if (step === 'signup')
      return {
        title: 'Mitenya dünyasına hoş geldin',
        body: 'Cilt bakımını sana özel hale getir. Üye ol, kampanyaları ve siparişlerini tek yerden yönet.',
        switchLabel: 'Zaten üye misin?',
        switchAction: 'Giriş Yap',
        switchTo: 'signin' as Step,
      };
    return {
      title: 'Biz de seni bekliyorduk',
      body: 'Hemen giriş yap, kaldığın yerden alışverişe devam et.',
      switchLabel: 'Henüz üye değil misin?',
      switchAction: 'Hemen Üye Ol',
      switchTo: 'signup' as Step,
    };
  }, [step]);

  const tabValue = step === 'signup' || step === 'verification' ? 'signup' : 'signin';

  return (
    <Stack sx={styles.root}>
      <Stack sx={styles.aside}>
        <Link href="/" aria-label="Mitenya ana sayfa" style={{ display: 'inline-flex' }}>
          <Image src="/static/images/logo.svg" alt="Mitenya" width={125} height={40} priority />
        </Link>

        <Typography component="h1" sx={styles.asideTitle}>
          {copy.title}
        </Typography>
        <Typography sx={styles.asideBody}>{copy.body}</Typography>

        <Stack sx={styles.switchRow}>
          <Typography sx={styles.asideBody}>{copy.switchLabel}</Typography>
          <Typography
            component="button"
            type="button"
            onClick={() => setStep(copy.switchTo)}
            sx={styles.switchLink}
          >
            {copy.switchAction}
          </Typography>
        </Stack>

        <Showcase />
      </Stack>

      <Stack sx={styles.panel}>
        <Stack sx={styles.panelInner}>
          {/* Mobilde sol sutun gizli — logo forma tasiniyor. */}
          <Stack sx={styles.mobileLogo}>
            <Link href="/" aria-label="Mitenya ana sayfa" style={{ display: 'inline-flex' }}>
              <Image src="/static/images/logo.svg" alt="Mitenya" width={125} height={40} priority />
            </Link>
          </Stack>
          {step === 'forgot-password' ? (
            <>
              <Typography component="h2" sx={styles.stepTitle}>
                Şifreni sıfırla
              </Typography>
              <ForgotPasswordForm onBack={() => setStep('signin')} onSubmit={forgotPassword} />
            </>
          ) : (
            <>
              <Stack sx={styles.tabs} role="tablist" aria-label="Giriş yap veya üye ol">
                {(
                  [
                    ['signin', 'Giriş Yap'],
                    ['signup', 'Üye Ol'],
                  ] as const
                ).map(([value, label]) => (
                  <Typography
                    key={value}
                    component="button"
                    type="button"
                    role="tab"
                    aria-selected={tabValue === value}
                    onClick={() => setStep(value)}
                    sx={styles.tab(tabValue === value)}
                  >
                    {label}
                  </Typography>
                ))}
              </Stack>

              {step === 'signin' && (
                <SignInForm
                  onSubmit={handleSignIn}
                  onForgotPassword={() => setStep('forgot-password')}
                  returnUrl={returnUrl}
                />
              )}
              {step === 'signup' && <SignUpForm onSubmit={handleSignUp} returnUrl={returnUrl} />}
              {step === 'verification' && (
                <>
                  <Typography component="h2" sx={styles.stepTitle}>
                    E-postanı doğrula
                  </Typography>
                  <VerificationForm
                    email={signupEmail}
                    onBack={() => setStep('signup')}
                    onResend={resendVerification}
                    onSubmit={handleVerify}
                  />
                </>
              )}
            </>
          )}

          <Stack sx={styles.orderTracking}>
            <Typography variant="body2" color="text.secondary">
              Üye olmadan verdiğin siparişler için
            </Typography>
            <Link href="/order-status" style={{ fontWeight: 700 }}>
              Sipariş Takibi
            </Link>
          </Stack>
        </Stack>
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
};

export default UyelikView;
