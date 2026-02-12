'use client';

import { Box, Checkbox, Divider, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { FormEvent, useEffect, useState } from 'react';
// Turnstile import'u şimdilik kaldırıldı
// import Turnstile from 'react-turnstile';
import Banner from '../common/Banner';
import Button from '../common/Button';
import Markdown from '../common/Markdown';
import ModalCard from '../common/ModalCard';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { setCookie } from 'cookies-next';
import Link from '../common/Link';
import { useSupabase } from '@/lib/supabase/client';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

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
  const supabase = useSupabase();

  // --------------------------------------
  // EMAIL STEP (Supabase OTP Gönder)
  // --------------------------------------
  const handleSubmitEmail = async (value: string) => {
    setEmail(value);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: value,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setCurrentStep('verification');
      return true;
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'E-posta gönderilirken hata oluştu'));
      return false;
    }
  };

  const handleResendCode = () => handleSubmitEmail(email);

  // --------------------------------------
  // VERIFICATION STEP (Supabase OTP Doğrula)
  // --------------------------------------
  const handleSubmitCode = async (code: string) => {
    try {
      if (!email) {
        setCurrentStep('email');
        return false;
      }

      const {
        data: { user },
        error: verifyError,
      } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (verifyError || !user) throw verifyError || new Error('Invalid code');

      setIsAuthenticated(true);

      let cd = await getCustomerData();

      if (!cd) {
        setIsNewUser(true);

        const newCustomerPayload = {
          name: 'User',
          surname: 'Account',
          email,
          culture: 'tr',
        };

        const created = await createCustomer(newCustomerPayload);
        if (!created) throw new Error('Müşteri profili oluşturulamadı.');

        cd = created;

        pushItemToDataLayer({
          event: 'sign_up',
          email_permission: true,
          sms_permission: false,
        });
      } else {
        setIsNewUser(false);
      }

      setCustomerData(cd);

      // Not: state async olduğundan, burada cd'nin yeni oluşup oluşmadığına göre karar verelim
      if (!cd) {
        setCookie('showFreeShippingPopup', 'true');
      } else if (isNewUser) {
        setCookie('showFreeShippingPopup', 'true');
      }

      await onSuccess?.();
      return true;
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'Kod doğrulanırken bir hata oluştu'));
      return false;
    }
  };

  if (!open) return null;

  return (
    <>
      {currentStep === 'email' ? (
        <EmailModal email={email} onClose={onClose} onSubmit={handleSubmitEmail} />
      ) : (
        <VerificationCodeModal
          email={email}
          onClose={onClose}
          onBack={() => setCurrentStep('email')}
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
  onSubmit: (value: string, options?: { signupConsentsAccepted?: boolean }) => Promise<boolean>;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin'); // giriş / kayıt modu
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const formik = useFormik<{ fullName: string; email: string }>({
    initialValues: { fullName: '', email },
    onSubmit: async (values) => {
      if (!values.email) return;

      if (isSignup && !consentAccepted) {
        setConsentError(true);
        return;
      }

      setConsentError(false);
      setLoading(true);
      await onSubmit(values.email, { signupConsentsAccepted: isSignup && consentAccepted });
      setLoading(false);
    },
  });
  const [error, setError] = useState<string | undefined>();

  const handleGoogleLogin = async () => {
    try {
      const currentPath = window.location.pathname || '/';
      console.log('[GoogleLogin] click', { currentPath });
  
      const target = `/auth/google/login?next=${encodeURIComponent(currentPath)}`;
      console.log('[GoogleLogin] redirecting to', target);
  
      window.location.href = target;
    } catch (err) {
      console.error('Google login error (client):', err);
      setError('Google ile giriş yapılırken hata oluştu');
    }
  };
  
  
  const isSignup = mode === 'signup';

  return (
    <ModalCard
      title={isSignup ? 'Hesap Oluştur' : 'Giriş Yap'}
      open
      onClose={onClose}
      showCloseIcon
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      CardProps={{
        sx: {
          width: { xs: 'calc(100% - 24px)', sm: 'fit-content' },
          maxWidth: { xs: 420, sm: 600 },
          borderRadius: { xs: 2, sm: 2 },
          mx: 'auto',
        },
      }}
    >
      <Stack gap={3}>
        {/* Başlık + açıklama */}
        <Stack gap={0.5}>
          <Typography variant="h2" fontSize={22} fontWeight={700}>
            {isSignup ? 'Yeni hesabını oluştur' : 'Hesabına giriş yap'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSignup
              ? 'Mitenya hesabınla alışverişini daha hızlı tamamla.'
              : 'E-posta ile giriş yapabilir veya Google ile devam edebilirsin.'}
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          onClick={handleGoogleLogin}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            py: 1.5,
            borderRadius: 999,
            fontWeight: 600,
            color: 'common.black',
            backgroundColor: 'common.white',
             borderColor: 'common.black',
            '&:hover': {
             backgroundColor: 'grey.100',
               borderColor: 'common.black',
          },
          }}
        >
          <img width="30" height="30" src="/static/images/socials/google.svg" alt="google-logo" style={{marginRight: "24px"}}/>
                 Google ile devam et
        </Button>

        {/* Ayırıcı */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            veya
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        {/* Form */}
        <Stack component="form" gap={2} onSubmit={formik.handleSubmit}>
          {isSignup && (
            <TextField
              fullWidth
              name="fullName"
              label="Ad Soyad"
              value={formik.values.fullName}
              onChange={formik.handleChange}
            />
          )}

          <TextField
            fullWidth
            name="email"
            label="E-posta adresi"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />

          {isSignup && (
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
          )}

          <Button loading={loading} variant="contained" arrow="end" type="submit" fullWidth>
            Kod Gönder
          </Button>
        </Stack>

        {/* Giriş / kayıt toggle */}
        <Box textAlign="center">
          {isSignup ? (
            <Typography variant="body2" color="text.secondary">
              Zaten hesabın var mı?{' '}
              <Typography
                component="button"
                type="button"
                variant="body2"
                sx={{
                  p: 0,
                  m: 0,
                  border: 'none',
                  background: 'transparent',
                  color: 'primary.main',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => setMode('signin')}
              >
                Giriş Yap
              </Typography>
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Hesabın yok mu?{' '}
              <Typography
                component="button"
                type="button"
                variant="body2"
                sx={{
                  p: 0,
                  m: 0,
                  border: 'none',
                  background: 'transparent',
                  color: 'primary.main',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => setMode('signup')}
              >
                Yeni hesap oluştur
              </Typography>
            </Typography>
          )}
        </Box>

        {!!error && <Banner variant="error" title={error} />}
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
}: {
  email: string;
  onResend: () => void;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (value: string) => Promise<boolean>;
}) => {
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    await onSubmit(code);
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
      showCloseIcon
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      CardProps={{
        sx: {
          width: { xs: 'calc(100% - 24px)', sm: 'fit-content' },
          maxWidth: { xs: 420, sm: 600 },
          borderRadius: { xs: 2, sm: 2 },
          mx: 'auto',
        },
      }}
    >
      <Markdown text={`${email} adresine gönderilen kodu gir`} />

      <Stack component="form" gap={3} onSubmit={handleSubmit}>
        <TextField
          value={code}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= 8) setCode(val);
          }}
          inputMode="numeric"
          autoFocus
        />

        {/* Turnstile geçici olarak devre dışı */}

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
            disabled={code.length < 6}
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
