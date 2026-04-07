'use client';

import { Snackbar } from '@mui/material';
import { useState } from 'react';
import Banner from '../common/Banner';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { setCookie } from 'cookies-next';
import { useSupabase } from '@/lib/supabase/client';
import ForgotPasswordModal from './ForgotPasswordModal';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';
import VerificationModal from './VerificationModal';

type Step = 'signin' | 'signup' | 'verification' | 'forgot-password';

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
  const [step, setStep] = useState<Step>('signin');
  const [signupEmail, setSignupEmail] = useState('');
  const { createCustomer, getCustomerData } = useCustomerData();
  const { setCustomerData, setIsAuthenticated } = useAuth();
  const supabase = useSupabase();

  // ---- Giriş ----
  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      // Hata mesajı intentionally genel — email enumeration önlemi
      if (signInError) throw new Error('E-posta veya şifre hatalı');

      await onSuccess?.();
      return true;
    } catch {
      // Hata gösterimi SignInModal'ın kendi Banner'ına bırakılıyor (çift hata önlemi)
      return false;
    }
  };

  // ---- Kayıt ----
  const handleSignUp = async (fullName: string, email: string, password: string) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;

      setSignupEmail(email);
      setStep('verification');
      return true;
    } catch {
      // Hata gösterimi SignUpModal'ın kendi Banner'ına bırakılıyor (çift hata önlemi)
      return false;
    }
  };

  // ---- OTP Doğrulama (sadece kayıt) ----
  const handleVerify = async (code: string) => {
    try {
      const {
        data: { user },
        error: verifyError,
      } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: code,
        type: 'email',
      });
      if (verifyError || !user) throw verifyError || new Error('Geçersiz kod');

      let cd = await getCustomerData();
      if (!cd) {
        const parts = (user.user_metadata?.full_name ?? '').trim().split(' ');
        const name = parts[0] || 'User';
        const surname = parts.slice(1).join(' ') || 'Account';
        const created = await createCustomer({ name, surname, email: signupEmail, culture: 'tr' });
        if (!created) throw new Error('Müşteri profili oluşturulamadı');
        cd = created;
        setCookie('showFreeShippingPopup', 'true');
        pushItemToDataLayer({ event: 'sign_up', email_permission: true, sms_permission: false });
      }

      // setIsAuthenticated, customerData hazır olduktan SONRA set ediliyor
      setCustomerData(cd);
      setIsAuthenticated(true);
      await onSuccess?.();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kod doğrulanırken hata oluştu');
      return false;
    }
  };

  const handleResendVerification = async () => {
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: signupEmail });
    if (resendError) setError('Doğrulama kodu gönderilemedi. Lütfen tekrar dene.');
  };

  // ---- Şifremi Unuttum ----
  const handleForgotPassword = async (email: string) => {
    // Supabase doğrudan çağrı yerine kendi API route'umuzu kullan:
    // sunucu katmanında IP + email bazlı rate limit uygulanıyor
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      }),
    });

    if (response.status === 429) {
      return {
        ok: false,
        message: 'Çok fazla deneme yaptın. Lütfen kısa bir süre bekleyip tekrar dene.',
      };
    }

    if (!response.ok) {
      console.error('[auth/forgot-password] request failed', {
        status: response.status,
        statusText: response.statusText,
      });
      return {
        ok: false,
        message: 'Şu anda şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar dene.',
      };
    }

    // Email enumeration önlemi: kullanıcı var/yok ayrımı yapmadan aynı başarı mesajı gösterilir
    return {
      ok: true,
      message: 'E-posta adresi sistemde kayıtlıysa şifre sıfırlama bağlantısı kısa süre içinde gönderilir.',
    };
  };

  if (!open) return null;

  return (
    <>
      {step === 'signin' && (
        <SignInModal
          onClose={onClose}
          onSubmit={handleSignIn}
          onForgotPassword={() => setStep('forgot-password')}
          onSwitchToSignup={() => setStep('signup')}
        />
      )}
      {step === 'signup' && (
        <SignUpModal
          onClose={onClose}
          onSubmit={handleSignUp}
          onSwitchToSignin={() => setStep('signin')}
        />
      )}
      {step === 'verification' && (
        <VerificationModal
          email={signupEmail}
          onClose={onClose}
          onBack={() => setStep('signup')}
          onResend={handleResendVerification}
          onSubmit={handleVerify}
        />
      )}
      {step === 'forgot-password' && (
        <ForgotPasswordModal
          onClose={onClose}
          onBack={() => setStep('signin')}
          onSubmit={handleForgotPassword}
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

export default Authenticator;
