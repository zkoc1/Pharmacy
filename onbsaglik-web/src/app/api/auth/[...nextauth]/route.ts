/**
 * NextAuth.js kimlik doğrulama API rotası.
 * Credentials, Google, Facebook ve Apple Sağlayıcıları (OAuth 2.0).
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';

import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const cleanEmail = credentials.email.trim().toLowerCase();

        // Admin credentials
        if (cleanEmail === 'admin@onbsaglik.com.tr' && (credentials.password === '123456' || credentials.password === 'onbAdmin2024!')) {
          return { id: 'admin', email: credentials.email, name: 'Admin', role: 'admin' };
        }
        if (cleanEmail === 'osman_nuri38@hotmail.com' && credentials.password === 'OsmanTashan4353+') {
          return { id: 'admin_osman', email: credentials.email, name: 'Osman Nuri Taşhan', role: 'admin' };
        }

        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null; // Login failed
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim() || data.user.email?.split('@')[0],
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '824105571389-dummy-google-client-id.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'dummy-facebook-app-id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy-facebook-app-secret',
    }),

    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || 'com.onbsaglik.web',
      clientSecret: process.env.APPLE_CLIENT_SECRET || 'dummy-apple-secret',
    }),
  ],
  pages: {
    signIn: '/hesabim/giris',
    error: '/hesabim/giris',
  },
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 saat (oturum 1 gün sonra otomatik düşer)
    updateAge: 60 * 60, // Kullanıcı aktifse saatte bir oturumu tazele
  },
  secret: process.env.NEXTAUTH_SECRET || 'onbsaglik-secret-key-development-only',
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 saat
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as typeof session.user;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
