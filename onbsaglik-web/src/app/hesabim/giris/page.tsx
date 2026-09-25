'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { setUserSession, setAdminSession } from '@/lib/authUtils';

export default function GirisPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Sadece Next-Auth signIn metodunu çağırıyoruz, 
    // arka planda Supabase kontrolü yapacak.

    const res = await signIn('credentials', {
      redirect: false,
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('E-posta adresi veya şifre hatalı.');
    } else {
      setUserSession({ email: cleanEmail });

      // Eğer admin e-postası ise admin çerezi ve oturumunu da otomatik senkronize et
      if (cleanEmail === 'admin@onbsaglik.com.tr' || cleanEmail === 'osman_nuri38@hotmail.com') {
        try {
          const adminAuthRes = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          if (adminAuthRes.ok) {
            const adminData = await adminAuthRes.json();
            if (adminData.success) {
              setAdminSession(adminData.user);
            }
          }
        } catch {}
      }

      router.push('/hesabim');
      router.refresh();
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Üye Kayıt / Üye Girişi Sekmeleri */}
          <div className="flex border-b border-gray-200 mb-8">
            <Link
              href="/hesabim/kayit"
              className="w-1/2 pb-3 text-center text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
            >
              ÜYE KAYIT
            </Link>
            <span className="w-1/2 pb-3 text-center text-sm font-extrabold text-emerald-600 border-b-2 border-emerald-600 uppercase tracking-wider">
              ÜYE GİRİŞİ
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
                E-posta Adresi *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
                Şifre *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-200 font-semibold">
                ⚠️ {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider"
              >
                {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
              </button>
            </div>

            {/* Sosyal Giriş Butonları geçici olarak kaldırıldı */}

          </form>
        </div>
      </div>
    </div>
  );
}
