'use client';

import { PhoneNumber } from '@/lib/api/types';
import { Checkbox, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { getProviders, signIn } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';
import Turnstile from 'react-turnstile';
import Banner from '../common/Banner';
import Button from '../common/Button';
import Markdown from '../common/Markdown';
import ModalCard from '../common/ModalCard';
import PhoneNumberInput from '../common/inputs/FormikPhoneNumberInput';
import useStyles from './styles';
import { useAuth } from '@/contexts/AuthContext';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { getLegacyLoginUrl } from '@/lib/utils/redirectToLogin';
import { setCookie } from 'cookies-next';
import Link from '../common/Link';
import { sendOTP, signUpOTP, verifyOTP } from '@/lib/api/auth';

const DEFAULT_PHONE_CODE = "+90"; // locale/region yok artık

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
  const [currentStep, setCurrentStep] = useState<'phone' | 'verification'>('phone');
  const [isNewUser, setIsNewUser] = useState(false);

  const { createCustomer, getCustomerData } = useCustomerData();
  const { setCustomerData, setIsAuthenticated } = useAuth();

  // region/locale olmadığı için default +90
  const [phone, setPhone] = useState<Partial<PhoneNumber>>({
    phoneCode: DEFAULT_PHONE_CODE,
    phoneNumber: '',
  });

  // --------------------------------------
  // PHONE STEP
  // --------------------------------------
  const handleSubmitPhoneNumber = async (values: PhoneNumber) => {
    setPhone(values);
    try {
      const { ok, isNewUser } = await sendOTP(values);
      if (!ok) throw new Error();
      setIsNewUser(isNewUser);
      setCurrentStep('verification');
      return true;
    } catch {
      setError("SMS gönderilirken hata oluştu");
      return false;
    }
  };

  const handleResendCode = () => handleSubmitPhoneNumber(phone as PhoneNumber);

  // --------------------------------------
  // VERIFICATION STEP
  // --------------------------------------
  const handleSubmitCode = async (value: string, turnstileToken: string) => {
    try {
      if (!phone.phoneCode || !phone.phoneNumber) {
        setCurrentStep('phone');
        return false;
      }

      let { ok, username } = await verifyOTP(value, phone as PhoneNumber);
      if (!ok) throw new Error("invalidCode");

      const providers = await getProviders();
      if (!providers) throw new Error("providerError");

      let loginSuccess = false;
      if (username) {
        const resp = await signIn(providers['cognito_credentials'].id, {
          redirect: false,
          username,
          password: value,
        });
        loginSuccess = resp?.ok ?? false;
      }

      if (!loginSuccess) {
        username = `${phone.phoneCode}${phone.phoneNumber}@site.com`;
        const signedUp = await signUpOTP(value, phone as PhoneNumber, turnstileToken);
        if (!signedUp) throw new Error("signupFailed");
      }

      setIsAuthenticated(true);

      if (isNewUser) {
        const newCustomer = {
          fullName: "User",
          email: username!,
          ...phone,
        };

        const created = await createCustomer({
          name: "User",
          surname: "Account",
          email: username!,
          culture: "tr", // locale yok ama backend istiyorsa sabit verebilirsin
          ...phone,
        });

        if (!created) throw new Error();

        pushItemToDataLayer({
          event: 'sign_up',
          email_permission: true,
          sms_permission: true,
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
      setError("Kod doğrulanırken bir hata oluştu");
      return false;
    }
  };

  if (!open) return null;

  return (
    <>
      {currentStep === 'phone' ? (
        <PhoneNumberModal phone={phone} onClose={onClose} onSubmit={handleSubmitPhoneNumber} />
      ) : (
        <VerificationCodeModal
          phone={phone}
          onClose={onClose}
          onBack={() => setCurrentStep('phone')}
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

type PhoneNumberFormValues = Partial<PhoneNumber> & { turnstileToken?: string };

const PhoneNumberModal = ({
  phone,
  onSubmit,
  onClose,
}: {
  phone: Partial<PhoneNumber>;
  onSubmit: (value: PhoneNumber) => Promise<boolean>;
  onClose: () => void;
}) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<PhoneNumberFormValues>({
    initialValues: { ...phone, turnstileToken: undefined },
    onSubmit: async (values) => {
      if (!values.phoneCode || !values.phoneNumber) return;
      setLoading(true);
      await onSubmit(values as PhoneNumber);
      setLoading(false);
    },
  });

  return (
    <ModalCard title="Telefon Doğrulama" open onClose={onClose}>
      <Stack component="form" gap={3} onSubmit={formik.handleSubmit}>
        <Typography>Telefon numaranı gir</Typography>

        <PhoneNumberInput formik={formik} fullWidth size="medium" />

        <Turnstile
          sitekey="0x4AAAAAAAHkez5HeFn8tozF"
          onVerify={(token) => formik.setFieldValue("turnstileToken", token)}
        />

        <Button loading={loading} variant="contained" arrow="end" type="submit">
          Kod Gönder
        </Button>

        <Typography sx={styles.legacyLogin}>
          <Link href={getLegacyLoginUrl()} colored>
            Eski giriş ekranı
          </Link>
        </Typography>
      </Stack>
    </ModalCard>
  );
};

const VerificationCodeModal = ({
  phone,
  onResend,
  onBack,
  onClose,
  onSubmit,
  isNewUser,
}: {
  phone: Partial<PhoneNumber>;
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
      title={<Button arrow="start" size="small" onClick={onBack}>Geri</Button>}
      open
      onClose={onClose}
    >
      <Markdown text={`+${phone.phoneCode} ${phone.phoneNumber} numarasına gönderilen kodu gir`} />

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
