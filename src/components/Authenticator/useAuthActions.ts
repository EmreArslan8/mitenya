'use client';

import { setCookie } from 'cookies-next';
import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { useSupabase } from '@/lib/supabase/client';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';

/**
 * Giris/kayit akisinin tum is mantigi. Daha once Authenticator modalinin
 * icinde yasiyordu; /uyelik sayfasina tasinirken UI'dan ayristirildi.
 */
const useAuthActions = () => {
  const [error, setError] = useState<string | undefined>();
  const [signupEmail, setSignupEmail] = useState('');
  const { createCustomer, getCustomerData } = useCustomerData();
  const { setCustomerData, setIsAuthenticated } = useAuth();
  const supabase = useSupabase();

  // ---- Giris ----
  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      // Hata mesaji intentionally genel — email enumeration onlemi
      return !signInError;
    },
    [supabase]
  );

  // ---- Kayit ----
  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) return false;

      setSignupEmail(email);
      return true;
    },
    [supabase]
  );

  // ---- OTP Dogrulama (sadece kayit) ----
  const verify = useCallback(
    async (code: string) => {
      try {
        const {
          data: { user },
          error: verifyError,
        } = await supabase.auth.verifyOtp({ email: signupEmail, token: code, type: 'email' });
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

        // setIsAuthenticated, customerData hazir olduktan SONRA set ediliyor
        setCustomerData(cd);
        setIsAuthenticated(true);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kod doğrulanırken hata oluştu');
        return false;
      }
    },
    [createCustomer, getCustomerData, setCustomerData, setIsAuthenticated, signupEmail, supabase]
  );

  const resendVerification = useCallback(async () => {
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: signupEmail });
    if (resendError) setError('Doğrulama kodu gönderilemedi. Lütfen tekrar dene.');
  }, [signupEmail, supabase]);

  // ---- Sifremi Unuttum ----
  const forgotPassword = useCallback(async (email: string) => {
    // Supabase dogrudan cagri yerine kendi API route'umuzu kullan:
    // sunucu katmaninda IP + email bazli rate limit uygulaniyor
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

    // Email enumeration onlemi: kullanici var/yok ayrimi yapmadan ayni basari mesaji gosterilir
    return {
      ok: true,
      message:
        'E-posta adresi sistemde kayıtlıysa şifre sıfırlama bağlantısı kısa süre içinde gönderilir.',
    };
  }, []);

  return {
    error,
    setError,
    signupEmail,
    signIn,
    signUp,
    verify,
    resendVerification,
    forgotPassword,
  };
};

export default useAuthActions;
