'use client';

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
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

type Step = 'signin' | 'signup' | 'verification' | 'forgot-password';

/** Open redirect onlemi: sadece kendi sitemizdeki mutlak yollara donulur. */
const sanitizeReturnUrl = (value: string | null) => {
  if (!value) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
};

const UyelikView = () => {
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
    <main className="relative flex flex-col md:min-h-screen md:flex-row">
      <aside className="hidden flex-1 basis-1/2 flex-col gap-6 bg-bg bg-[radial-gradient(120%_80%_at_0%_0%,rgba(193,18,31,0.05)_0%,rgba(255,255,255,0)_55%)] px-12 py-14 md:flex lg:px-16">
        <Link href="/" aria-label="Mitenya ana sayfa" style={{ display: 'inline-flex' }}>
          <Image src="/static/images/logo.svg" alt="Mitenya" width={125} height={40} priority unoptimized />
        </Link>

        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em] text-text lg:text-[32px]">
          {copy.title}
        </h1>
        <p className="max-w-[460px] text-[15px] leading-[1.8] text-text-medium-light">{copy.body}</p>

        <div className="flex flex-wrap items-center gap-2">
          <p className="max-w-[460px] text-[15px] leading-[1.8] text-text-medium-light">{copy.switchLabel}</p>
          <button
            type="button"
            onClick={() => setStep(copy.switchTo)}
            className="border-0 bg-transparent p-0 text-[15px] font-semibold text-text underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            {copy.switchAction}
          </button>
        </div>

        <Showcase />
      </aside>

      <section className="flex flex-1 basis-1/2 items-center bg-white px-5 py-8 sm:px-8 md:border-l md:border-gray-100 md:bg-bg-dark md:px-12 md:py-14 lg:px-16">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-6 md:mt-16 [&_[data-auth-field]]:rounded-none">
          {/* Mobilde sol sutun gizli — logo forma tasiniyor. */}
          <div className="mb-2 flex self-center md:hidden">
            <Link href="/" aria-label="Mitenya ana sayfa" style={{ display: 'inline-flex' }}>
              <Image src="/static/images/logo.svg" alt="Mitenya" width={125} height={40} priority unoptimized />
            </Link>
          </div>
          {step === 'forgot-password' ? (
            <>
              <h2 className="text-xl font-semibold leading-[1.3] text-text sm:text-[22px]">
                Şifreni sıfırla
              </h2>
              <ForgotPasswordForm onBack={() => setStep('signin')} onSubmit={forgotPassword} />
            </>
          ) : (
            <>
              <div className="flex w-full items-stretch border-b border-gray-100 md:gap-8 md:border-0" role="tablist" aria-label="Giriş yap veya üye ol">
                {(
                  [
                    ['signin', 'Giriş Yap'],
                    ['signup', 'Üye Ol'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={tabValue === value}
                    onClick={() => setStep(value)}
                    className={cn(
                      'mb-[-1px] flex-1 border-0 border-b-2 bg-transparent p-0 pb-3 text-center text-[17px] leading-tight transition-colors md:mb-0 md:flex-none md:border-0 md:pb-0 md:text-[22px] md:underline-offset-8',
                      tabValue === value
                        ? 'border-text font-semibold text-text md:underline'
                        : 'border-transparent font-normal text-text-medium-light',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

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
                  <h2 className="text-xl font-semibold leading-[1.3] text-text sm:text-[22px]">
                    E-postanı doğrula
                  </h2>
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

          <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
            <p className="text-sm text-text-medium-light">
              Üye olmadan verdiğin siparişler için
            </p>
            <Link href="/order-status" style={{ fontWeight: 700 }}>
              Sipariş Takibi
            </Link>
          </div>
        </div>
      </section>

      <Toast
        open={!!error}
        duration={5000}
        onClose={() => setError(undefined)}
        position="top-center"
      >
        <Banner variant="error" title={error} />
      </Toast>
    </main>
  );
};

export default UyelikView;
