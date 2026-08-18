/**
 * NextAuth.js kimlik doğrulama API rotası.
 * Credentials, Google, Facebook ve Apple Sağlayıcıları (OAuth 2.0).
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        if (credentials.password.length >= 6) {
          return {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0],
          };
        }
        return null;
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
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET ?? 'onbsaglik-nextauth-secret-2024',
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
});

export { handler as GET, handler as POST };
