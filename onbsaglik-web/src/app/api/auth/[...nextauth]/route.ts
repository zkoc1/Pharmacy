/**
 * NextAuth.js kimlik doğrulama API rotası.
 * Credentials provider ile e-posta/şifre girişi.
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        // Gerçek uygulamada NestJS API'ye istek atılır
        // Şimdilçe basit demo girişi (Supabase entegrasyonu Faz 2)
        if (!credentials?.email || !credentials?.password) return null;
        
        // Demo: herhangi e-posta + min 6 karakter şifre ile giriş
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
