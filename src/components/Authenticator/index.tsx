'use client';

// Supabase Client'ı ekleyin


import { Checkbox, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
// import { getProviders, signIn } from 'next-auth/react'; // NextAuth SİLİNDİ
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
import Icon from '../Icon';
import { useSupabase } from '@/lib/supabase/client';

// NOT: Eğer email OTP için kendi backend API'nizi kullanmaya devam edecekseniz bu importlar kalabilir.
// Ancak Supabase'e tam geçiş için 'signInWithOtp' kullanacağız.
// import { sendEmailOTP, verifyEmailOTP, signUpEmailOTP } from '@/lib/api/auth';

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
  const [isNewUser, setIsNewUser] = useState(false); // Supabase bu bilgiyi giriş anında direkt vermeyebilir, logic değişebilir.
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
      // Supabase Email OTP Gönderimi
      const { error } = await supabase.auth.signInWithOtp({
        email: value,
        options: {
          // Eğer email linki değil sadece kod istiyorsanız Supabase ayarlarından "Email Link" kapatılmalı veya flow type PKCE olmalı
          // Supabase varsayılan olarak Magic Link gönderir. Kod göndermek için backend ayarı gerekebilir.
          // Burada varsayımımız Supabase'in size 6 haneli kod gönderdiği yönündedir.
          shouldCreateUser: true, 
        }
      });

      if (error) throw error;
      
      // Not: Supabase 'isNewUser' bilgisini bu aşamada dönmez. 
      // Bunu doğrulama sonrası DB kontrolü ile anlayacağız.
      
      setCurrentStep('verification');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'E-posta gönderilirken hata oluştu');
      return false;
    }
  };

  const handleResendCode = () => handleSubmitEmail(email);

  // --------------------------------------
  // VERIFICATION STEP (Supabase OTP Doğrula)
  // --------------------------------------
  const handleSubmitCode = async (code: string, turnstileToken: string) => {
    try {
      if (!email) {
        setCurrentStep('email');
        return false;
      }

      // Supabase OTP Doğrulama
      const { data: { session, user }, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (verifyError || !user) throw verifyError || new Error('Invalid code');

      // Giriş Başarılı
      setIsAuthenticated(true);

      // Kullanıcı Veritabanında Var mı Kontrolü (isNewUser Logici)
      // SQL Trigger kullanıyorsanız kullanıcı zaten 'customers' tablosuna eklendi/eklenecek.
      // Biz burada profil verisini çekmeye çalışalım.
      let cd = await getCustomerData();
      
      // Eğer veri henüz gelmediyse (Trigger gecikmesi veya yeni üye), manuel oluşturma deneyelim
      if (!cd) {
         setIsNewUser(true);
         
         const newCustomerPayload = {
            name: 'User',
            surname: 'Account',
            email: email,
            culture: 'tr',
         };

         // Veritabanına yaz (Upsert mantığıyla çalışmalı)
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
      if (isNewUser) {
        setCookie('showFreeShippingPopup', 'true');
      }

      await onSuccess?.();
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Kod doğrulanırken bir hata oluştu');
      return false;
    }
  };

  if (!open) return null;

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
          isNewUser={isNewUser} // Supabase akışında bu state'i yönetmek zorlaşabilir, UI'da şartları her zaman gösterebilirsiniz veya kaldırabilirsiniz.
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

  const supabaseClient = useSupabase();
  const [error, setError] = useState<string | undefined>();
 
  const handleGoogleLogin = async () => {
    try {
      // Mevcut sayfaya geri dönmek için next parametresi ekle
      const currentPath = window.location.pathname;
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google ile giriş yapılırken hata oluştu');
    }
  };
 


  return (
    <ModalCard title="Giriş Yap" open onClose={onClose}>
      <Stack gap={3}>
        <Button
          variant="outlined"
          onClick={handleGoogleLogin} // YENİ FONKSİYON
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

// VerificationCodeModal bileşeni aynı kalabilir, logic Authenticator içinde halledildi.
// src/components/Authenticator/index.tsx içindeki VerificationCodeModal bileşeni

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
          // DEĞİŞİKLİK 1: Limit 6'dan 8'e çıkarıldı (veya kaldırıldı)
          onChange={(e) => {
             const val = e.target.value;
             if (val.length <= 8) setCode(val);
          }}
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
            // DEĞİŞİKLİK 2: Buton artık 6 karakterden uzun kodları da kabul ediyor
            disabled={code.length < 6 || !turnstileToken}
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