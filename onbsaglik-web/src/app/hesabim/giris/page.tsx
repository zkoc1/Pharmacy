'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

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

    const res = await signIn('credentials', {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('E-posta adresi veya şifre hatalı.');
    } else {
      router.push('/hesabim');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Üye Kayıt / Üye Girişi Sekmeleri (Görsel 1-2 Birebir) */}
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
                placeholder="fkoc899@gmail.com"
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

            {/* Ve Ya Sepatörü & Sosyal Giriş */}
            <div className="pt-6 text-center">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-4 text-xs font-bold text-gray-400">veya</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => signIn('credentials', { redirect: false, email: 'facebook_user@onbsaglik.com', password: 'demoPassword123' })}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  f GİRİŞ YAP
                </button>
                <button
                  type="button"
                  onClick={() => signIn('credentials', { redirect: false, email: 'google_user@onbsaglik.com', password: 'demoPassword123' })}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  <span className="text-blue-500 font-black">G</span> GİRİŞ YAP
                </button>
                <button
                  type="button"
                  onClick={() => signIn('credentials', { redirect: false, email: 'apple_user@onbsaglik.com', password: 'demoPassword123' })}
                  className="flex items-center justify-center gap-2 bg-black text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                   GİRİŞ YAP
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
