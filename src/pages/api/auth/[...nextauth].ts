
import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import qs from 'qs';
import CognitoCredentialsProvider from './cognitoCredentialsProvider';
import { TOuathProvider, getOauthProvider } from './cognitoOauthProvider';
import axiosInstance, { CommonAxiosResponse } from '@/lib/simpleAxios';

const COOKIE_PREFIX = 'bringist';
const USE_SECURE_COOKIE = process.env.NODE_ENV != 'development';
const COOKIE_DOMAIN = process.env.NODE_ENV === 'development' ? 'localhost' : '.bringist.com';

export const authOptions: AuthOptions = {
  providers: [
    CognitoCredentialsProvider,
    ...(['Google'].map((provider) => getOauthProvider(provider as TOuathProvider)) as any),
  ],
  //DOCUMENTATION: https://next-auth.js.org/configuration/callbacks
  callbacks: {
    async signIn({ user }) {
      // console.log('user', user);
      // Return true to allow sign in and false to block sign in.
      if (!user) return false;

      return true;
    },
    async redirect({ url}) {
      // Return the url to redirect to after successful sign in.
      return url;
    },
    async jwt({ token, account, user }) {
      //new login
      if (account) {
        token.accessToken = account.access_token ?? user?.tokens?.access_token;
        token.idToken = account.id_token ?? user?.tokens?.id_token;
        token.refreshToken = account.id_token ?? user?.tokens?.refresh_token;
        token.expiresAt = user?.tokens?.expiresAt;
        token.roles = user.roles;

        return token;
      }

      if (new Date().getTime() < (token.expiresAt as number)) {
        // Access/Id token are still valid, return them as is.
        return token;
      }

      // Access/Id tokens have expired, retrieve new tokens using the
      // refresh token
      try {
        const {
          COGNITO_DOMAIN,
          COGNITO_CREDENTIALS_CLIENT_ID,
        } = process.env;

        //TODO: oauth ile gelen kullanıcı da bu yöntemle credential alabiliyor mu?
        const response = (await axiosInstance.post(
          `${COGNITO_DOMAIN}/oauth2/token`,
          qs.stringify({
            client_id: COGNITO_CREDENTIALS_CLIENT_ID,
            // client_secret: COGNITO_OAUTH_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        )) as CommonAxiosResponse;

        
        if (!response.ok) throw response.error;

        return {
          ...token,
          accessToken: response.access_token,
          idToken: response.id_token,
          expiresAt: new Date().getTime() + Number(response.expires_in) * 1000,
        };
      } catch (error) {
        // Could not refresh tokens, return error
        console.error('Error refreshing access and id tokens: ', error);
        return { ...token, error: 'RefreshTokensError' as const };
      }
    },
    async session({ session, token }) {
      /* The session callback is called whenever a session is checked. By default, only a subset of 
      the token is returned for increased security. If you want to make something available you added 
      to the token (like access_token and user.id from above)  via the jwt() callback, you have to explicitly 
      forward it here to make it available to the client. */
      const sessionObj = {
        ...session,
        user: {
          ...session.user,
          roles: token.roles,
          id: token.sub,
        },
        accessToken: token.accessToken,
        idToken: token.idToken,
        expires: `${token.expiresAt}`,
      };
      // console.log('sessionObj', sessionObj);
      return sessionObj;
    },
  },
  cookies: {
    sessionToken: {
      name: `${COOKIE_PREFIX}-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: USE_SECURE_COOKIE,
        domain: COOKIE_DOMAIN,
      },
    },
    callbackUrl: {
      name: `${COOKIE_PREFIX}-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: USE_SECURE_COOKIE,
        domain: COOKIE_DOMAIN,
      },
    },
    csrfToken: {
      name: `${COOKIE_PREFIX}-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: USE_SECURE_COOKIE,
        domain: COOKIE_DOMAIN,
      },
    },
    pkceCodeVerifier: {
      name: `${COOKIE_PREFIX}-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: USE_SECURE_COOKIE,
        maxAge: 900,
        domain: COOKIE_DOMAIN,
      },
    },
    state: {
      name: `${COOKIE_PREFIX}-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: USE_SECURE_COOKIE,
        maxAge: 900,
        domain: COOKIE_DOMAIN,
      },
    },
    nonce: {
      name: `${COOKIE_PREFIX}-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: USE_SECURE_COOKIE,
        domain: COOKIE_DOMAIN,
      },
    },
  },
};

export default NextAuth(authOptions);
