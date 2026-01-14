// LEGACY: NextAuth type definitions - Artık kullanılmıyor
// Supabase Auth'a geçildi - 2026-01-13

/*
/* eslint-disable @typescript-eslint/no-unused-vars *\/
import { User } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    tokens: JWT;
    roles: Array<string>;
  }

  interface Session extends DefaultSession {
    user: User;
    idToken: string;
    accessToken: string;
  }
}
*/
