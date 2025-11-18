/*

import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

export interface SignupRequestBody {
  name: string;
  lastname: string;
  email: string;
  password: string;
  userLocale?: string;
}

interface SignupRequest extends NextApiRequest {
  body: SignupRequestBody;
}

interface SignupError {
  code: string;
  message: string;
}

export default async function handler(req: SignupRequest, res: NextApiResponse) {
  if (req.method != 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Validate the token by calling the
  // "/siteverify" API endpoint.
  let formData = new FormData();
  formData.append('secret', '0x4AAAAAAAHkeyQs8KF639SthC-eXWe9Plw');
  formData.append('response', (req.body as any).turnstileToken);
  formData.append('remoteip', (req.headers as any)['x-forwarded-for']!);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const result = await fetch(url, {
    body: formData,
    method: 'POST',
  });

  const cfRes = await result.json();
  if (!cfRes.success) {
    res.status(400).json({ message: 'Bad request.' });
    return;
  }

  const { id, error } = await SignUp(req.body);

  if (error) res.status(400).json(error);
  else res.status(200).json({ id });
}

async function SignUp(params: SignupRequestBody): Promise<{ id?: string; error?: SignupError }> {
  try {
    const userPool = new CognitoUserPool({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      ClientId: process.env.COGNITO_CREDENTIALS_CLIENT_ID!,
    });
    const { name, lastname, email, password, userLocale } = params;

    const attributeList: Array<CognitoUserAttribute> = [];

    attributeList.push(
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      })
    );

    attributeList.push(
      new CognitoUserAttribute({
        Name: 'family_name',
        Value: lastname,
      })
    );

    attributeList.push(
      new CognitoUserAttribute({
        Name: 'name',
        Value: name,
      })
    );

    attributeList.push(
      new CognitoUserAttribute({
        Name: 'locale',
        Value: userLocale ?? 'en',
      })
    );

    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, [], function (err, result) {
        const id = result?.userSub;
        if (err || !id) {
          console.log('err', err);
          reject({
            error: {
              code: err?.name,
              message: err?.message,
            },
          });
        }
        console.log(id);
        resolve({ id });
      });
    });
  } catch (error) {
    return { error: error as SignupError };
  }
}

*/
