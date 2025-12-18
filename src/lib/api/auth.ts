import { setCookie } from 'cookies-next';
import { getProviders, signIn } from 'next-auth/react';
import { PhoneNumber } from './types';
import  bring  from './bring';



export const sendOTP = async (values: PhoneNumber) => {
  try {
    const [{ ok, isNewUser }] = await bring('/api/authentication/passwordless', {
      body: values,
    });
    return { ok, isNewUser };
  } catch (error) {
    console.log(error);
    return { ok: false, isNewUser: undefined };
  }
};

export const verifyOTP = async (
  code: string,
  phone: PhoneNumber
): Promise<{ ok: boolean; username: string | undefined | null }> => {
  try {
    const [res, err] = await bring('/api/authentication/passwordless', {
      body: { code, ...phone },
      method: 'PATCH',
    });
    if (err) throw err;
    return res;
  } catch (error) {
    return { ok: false, username: undefined };
  }
};

export const signUpOTP = async (code: string, phone: PhoneNumber, turnstileToken: string) => {
  try {
    const providers = await getProviders();
    if (!providers) throw new Error('Error initializing providers.');

    const email = `${phone.phoneCode}${phone.phoneNumber}@kozmedo.com`;

    setCookie('phone', JSON.stringify(phone));

    const [, err] = await bring('/api/signup', {
      body: {
        name: ' Kozmedo',
        lastname: 'User',
        password: code,
        email,
        userLocale: 'tr',
        turnstileToken,
      },
      method: 'POST',
    });

    if (err) throw err;

    await signIn(providers['cognito_credentials'].id, {
      redirect: false,
      username: email,
      password: code,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// lib/api/auth.ts
export async function sendEmailOTP(email: string) {
  const res = await fetch('/api/auth/send-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json() as Promise<{ ok: boolean; isNewUser: boolean }>;
}

export async function verifyEmailOTP(code: string, email: string) {
  const res = await fetch('/api/auth/verify-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, email }),
  });
  return res.json() as Promise<{ ok: boolean; username?: string }>;
}

export async function signUpEmailOTP(
  code: string,
  email: string,
  turnstileToken: string
) {
  const res = await fetch('/api/auth/signup-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, email, turnstileToken }),
  });
  return res.json() as Promise<{ ok: boolean }>;
}
