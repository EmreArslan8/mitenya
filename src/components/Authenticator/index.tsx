'use client';

import { Checkbox, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { getProviders, signIn } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';
import Turnstile from 'react-turnstile';
import Banner from '../common/Banner';
import Button from '../common/Button';
import Markdown from '../common/Markdown';
import ModalCard from '../common/ModalCard';
import useStyles from './styles';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { setCookie } from 'cookies-next';
import Link from '../common/Link';
import {
  sendEmailOTP,
  verifyEmailOTP,
  signUpEmailOTP,
} from '@/lib/api/auth';
import Icon from '../Icon';



const Authenticator = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void> | void;
}) => {
  const [error, setError] = useState<string | undefined>();
  const [currentStep, setCurrentStep] = useState<'email' | 'verification'>('email');
  const [isNewUser, setIsNewUser] = useState(false);

  const { createCustomer, getCustomerData } = useCustomerData();
  const { setCustomerData, setIsAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>('');

  // --------------------------------------
  // EMAIL STEP
  // --------------------------------------
  const handleSubmitEmail = async (value: string) => {
    setEmail(value);
    try {
      const { ok, isNewUser } = await sendEmailOTP(value);
      if (!ok) throw new Error();
      setIsNewUser(isNewUser);
      setCurrentStep('verification');
      return true;
    } catch {
      setError('E-posta gönderilirken hata oluştu');
      return false;
    }
  };

  const handleResendCode = () => handleSubmitEmail(email);

  // --------------------------------------
  // VERIFICATION STEP
  // --------------------------------------
  const handleSubmitCode = async (code: string, turnstileToken: string) => {
    try {
      if (!email) {
        setCurrentStep('email');
        return false;
      }

      let { ok, username } = await verifyEmailOTP(code, email);
      if (!ok) throw new Error('invalidCode');

      const providers = await getProviders();
      if (!providers) throw new Error('providerError');

      let loginSuccess = false;

      // Cognito credentials ile login dene
      if (username) {
        const resp = await signIn(providers['cognito_credentials'].id, {
          redirect: false,
          username,
          password: code,
        });
        loginSuccess = resp?.ok ?? false;
      }

      // Kullanıcı yoksa sign up
      if (!loginSuccess) {
        username = email;
        const signedUp = await signUpEmailOTP(code, email, turnstileToken);
        if (!signedUp?.ok) throw new Error('signupFailed');
      }

      setIsAuthenticated(true);

      if (isNewUser) {
        const newCustomer = {
          fullName: 'User',
          email: username!,
        };

        const created = await createCustomer({
          name: 'User',
          surname: 'Account',
          email: username!,
          culture: 'tr',
        });

        if (!created) throw new Error();

        pushItemToDataLayer({
          event: 'sign_up',
          email_permission: true,
          sms_permission: false,
        });

        setCustomerData(newCustomer);
        setCookie('showFreeShippingPopup', 'true');
      } else {
        const cd = await getCustomerData();
        if (!cd) throw new Error();
        setCustomerData(cd);
      }

      await onSuccess?.();
      return true;
    } catch (err) {
      console.error(err);
      setError('Kod doğrulanırken bir hata oluştu');
      return false;
    }
  };

  if (!open) return null;

  useEffect(() => {
    getProviders().then(console.log);
  }, []);
  

  return (
    <>
      {currentStep === 'email' ? (
        <EmailModal
          email={email}
          onClose={onClose}
          onSubmit={handleSubmitEmail}
        />
      ) : (
        <VerificationCodeModal
          email={email}
          onClose={onClose}
          onBack={() => setCurrentStep('email')}
          isNewUser={isNewUser}
          onResend={handleResendCode}
          onSubmit={handleSubmitCode}
        />
      )}

      <Snackbar
        open={!!error}
        onClose={() => setError(undefined)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Banner variant="error" title={error} />
      </Snackbar>
    </>
  );
};

const EmailModal = ({
  email,
  onSubmit,
  onClose,
}: {
  email: string;
  onSubmit: (value: string) => Promise<boolean>;
  onClose: () => void;
}) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<{ email: string; turnstileToken?: string }>({
    initialValues: { email, turnstileToken: undefined },
    onSubmit: async (values) => {
      if (!values.email) return;
      setLoading(true);
      await onSubmit(values.email);
      setLoading(false);
    },
  });

  const handleGoogleLogin = () => {
    // Google ile giriş
    signIn('google', {
      callbackUrl: window.location.pathname || '/',
    });
  };

  return (
    <ModalCard title="Giriş Yap" open onClose={onClose}>
      <Stack gap={3}>
      <Button
  variant="outlined"
  onClick={() => {
    console.log("Google login clicked → signIn('google') çağrılıyor");
    signIn("google", { callbackUrl: "/cart" });
  }}
  startIcon={<Icon name="google" />}
>
  Google ile Giriş Yap
</Button>




        <Typography align="center">veya e-posta ile devam et</Typography>

        <Stack component="form" gap={2} onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            name="email"
            label="E-posta adresi"
            value={formik.values.email}
            onChange={formik.handleChange}
          />

          <Turnstile
            sitekey="0x4AAAAAAAHkez5HeFn8tozF"
            onVerify={(token) => formik.setFieldValue('turnstileToken', token)}
          />

          <Button loading={loading} variant="contained" arrow="end" type="submit">
            Kod Gönder
          </Button>
        </Stack>

        <Typography sx={styles.legacyLogin}>
          <Link href="/legacy-login" colored>
            Eski giriş ekranı
          </Link>
        </Typography>
      </Stack>
    </ModalCard>
  );
};

const VerificationCodeModal = ({
  email,
  onResend,
  onBack,
  onClose,
  onSubmit,
  isNewUser,
}: {
  email: string;
  onResend: () => void;
  onBack: () => void;
  onClose: () => void;
  isNewUser: boolean;
  onSubmit: (value: string, turnstileToken: string) => Promise<boolean>;
}) => {
  const styles = useStyles();
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isNewUser && !termsAccepted) {
      setTermsError(true);
      return;
    }

    if (!turnstileToken) return;

    setLoading(true);
    await onSubmit(code, turnstileToken);
    setLoading(false);
  };

  useEffect(() => {
    if (seconds > 0) {
      const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [seconds]);

  return (
    <ModalCard
      title={
        <Button arrow="start" size="small" onClick={onBack}>
          Geri
        </Button>
      }
      open
      onClose={onClose}
    >
      <Markdown text={`${email} adresine gönderilen kodu gir`} />

      <Stack component="form" gap={3} onSubmit={handleSubmit}>
        <TextField
          value={code}
          onChange={(e) => e.target.value.length <= 6 && setCode(e.target.value)}
          inputMode="numeric"
          autoFocus
        />

        <Turnstile sitekey="0x4AAAAAAAHkez5HeFn8tozF" onVerify={setTurnstileToken} />

        {isNewUser && (
          <Banner noIcon variant={termsError ? 'error' : 'neutral'} border>
            <Stack direction="row">
              <Checkbox
                size="small"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <Typography>
                <Link href="/terms-of-service">Kullanım Şartları</Link> ve
                <Link href="/privacy-policy"> Gizlilik Politikası</Link>’nı kabul ediyorum
              </Typography>
            </Stack>
          </Banner>
        )}

        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            disabled={seconds > 0}
            onClick={() => {
              onResend();
              setSeconds(60);
            }}
          >
            Yeniden Gönder ({seconds})
          </Button>

          <Button
            loading={loading}
            variant="contained"
            arrow="end"
            disabled={code.length !== 6 || !turnstileToken}
            type="submit"
          >
            Doğrula
          </Button>
        </Stack>
      </Stack>
    </ModalCard>
  );
};

export default Authenticator;
