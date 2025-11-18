/*

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BRINGIST_API_URL;

export const POST = async (req: NextRequest) => {
  const { phoneCode, phoneNumber, turnstileToken } = await req.json();

  if (!phoneCode || !phoneNumber || !turnstileToken)
    return NextResponse.json({ ok: false, message: 'Bad request' }, { status: 400 });

  try {
    // Validate the token by calling the
    // "/siteverify" API endpoint.
    let formData = new FormData();
    formData.append('secret', '0x4AAAAAAAHkeyQs8KF639SthC-eXWe9Plw');
    formData.append('response', turnstileToken);
    formData.append('remoteip', req.ip!);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    const cfRes = await result.json();
    if (!cfRes.success)
      return NextResponse.json({ ok: false, message: 'Bad request.' }, { status: 400 });

    const res = await fetch(`${API_URL}/v1/auth/passwordless`, {
      body: JSON.stringify({ phoneCode, phoneNumber }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    
    const { isNewUser } = await res.json();
    if (res.status !== 200) throw new Error();
    return NextResponse.json({ ok: true, isNewUser }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
};

export const PATCH = async (req: NextRequest) => {
  const { code, phoneCode, phoneNumber } = await req.json();

  if (!phoneCode || !phoneNumber)
    return NextResponse.json({ ok: false, message: 'Bad request' }, { status: 400 });

  try {
    const res = await fetch(`${API_URL}/v1/auth/passwordless`, {
      body: JSON.stringify({ code, phoneCode, phoneNumber }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    
    const data = await res.json();

    if (res.status !== 200) throw new Error('Unexpected error during verification. (PATCH)');

    return NextResponse.json({ ok: true, username: data.userName }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
};

*/