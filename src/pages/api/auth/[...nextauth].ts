import axiosInstance, { CommonAxiosResponse } from '@/lib/simpleAxios';
import { AuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from "next-auth/providers/google";
import qs from 'qs';

import CognitoCredentialsProvider from './cognitoCredentialsProvider';

const COOKIE_PREFIX = 'kozmedo';
const USE_SECURE_COOKIE = process.env.NODE_ENV !== 'development';
const COOKIE_DOMAIN =
  process.env.NODE_ENV === 'development' ? 'localhost' : '.kozmedo.com';

console.log("---- Loading Auth Providers ----");

// GOOGLE PROVIDER
const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});
console.log("Loaded provider:", googleProvider.id);

// COGNITO CREDENTIALS PROVIDER
console.log("Loaded provider:", CognitoCredentialsProvider.id);

// FINAL PROVIDER LIST
const providersList = [
  googleProvider,
  CognitoCredentialsProvider,
];

console.log("FINAL provider list:", providersList.map(p => p.id));

export const authOptions: AuthOptions = {
  providers: providersList,

  callbacks: {

    async signIn({ user, account }) {
      console.log("SIGN-IN callback:", { user, account });
    
      // Sadece Google login sonrası çalıştır
      if (account?.provider === "google") {
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider_id: user.id,
              full_name: user.name,
              email: user.email,
            }),
          });
    
          console.log("Google user synced to Supabase");
        } catch (err) {
          console.error("Failed to sync Google user →", err);
        }
      }
    
      return true;
    },

    async redirect({ url }) {
      return url;
    },

    async jwt({ token, account, user }) {
      console.log("JWT callback:", { token, account, user });

      // 1) İlk giriş anında token oluştur
      if (account) {
        token.provider = account.provider; // google | credentials

        token.sub = account.providerAccountId ?? user?.id;

        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        return token;
      }

      // 2) GOOGLE kullanıcıları için refresh işlemi yok
      if (token.provider === "google") {
        return token;
      }

      // 3) Eğer Cognito refresh token yoksa → dokunma
      if (!token.refreshToken) {
        return token;
      }

      if (token.expiresAt && Date.now() < Number(token.expiresAt)) {
        return token;
      }
      

      // 5) Cognito refresh akışı
      try {
        console.log("JWT expired → refreshing via Cognito");

        const { COGNITO_DOMAIN, COGNITO_CREDENTIALS_CLIENT_ID } = process.env;

        const response = (await axiosInstance.post(
          `${COGNITO_DOMAIN}/oauth2/token`,
          qs.stringify({
            client_id: COGNITO_CREDENTIALS_CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )) as CommonAxiosResponse;

        if (!response.ok) throw response.error;

        return {
          ...token,
          accessToken: response.access_token,
          idToken: response.id_token,
          expiresAt: Date.now() + Number(response.expires_in) * 1000,
        };
      } catch (err) {
        console.error("JWT Refresh Error:", err);
        return { ...token, error: "RefreshTokensError" };
      }
    },

    // <— BURADA VİRGÜL ŞART!
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub, // hem Google hem Cognito için normalize edildi
          roles: token.roles,
        },
        accessToken: token.accessToken,
        idToken: token.idToken,
        expires: `${token.expiresAt}`,
      };
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
  },
};

export default NextAuth(authOptions);
