'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, User, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function KayitPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  // Sözleşme Onayları
  const [emailNotice, setEmailNotice] = useState(true);
  const [smsNotice, setSmsNotice] = useState(true);
  const [callNotice, setCallNotice] = useState(false);
  const [termsAgree, setTermsAgree] = useState(true);
  const [kvkkAgree, setKvkkAgree] = useState(true);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    if (!firstName.trim() || !lastName.trim()) {
      setError('Lütfen Ad ve Soyad alanlarını doldurun.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (!termsAgree || !kvkkAgree) {
      setError('Lütfen Üyelik ve KVKK sözleşmelerini kabul edin.');
      return;
    }

    // MÜKERRER E-POSTA KONTROLÜ
    const registeredUsersRaw = localStorage.getItem('onbsaglik_registered_users');
    let registeredUsers: { email: string; name: string; phone: string }[] = [];
    if (registeredUsersRaw) {
      try {
        registeredUsers = JSON.parse(registeredUsersRaw);
      } catch {}
    }

    const isDuplicate = registeredUsers.some((u) => u.email === cleanEmail);
    if (isDuplicate) {
      setError('Bu e-posta adresi ile zaten kayıtlı bir hesap bulunmaktadır. Lütfen giriş yapın.');
      return;
    }

    setLoading(true);

    // Yeni kullanıcıyı kaydet
    const newUser = { email: cleanEmail, name: fullName, phone, role: 'customer' };
    registeredUsers.push(newUser);
    localStorage.setItem('onbsaglik_registered_users', JSON.stringify(registeredUsers));
    localStorage.setItem('user_session', JSON.stringify(newUser));

    const res = await signIn('credentials', {
      redirect: false,
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('Kayıt oluşturulamadı. Lütfen bilgilerinizi kontrol edin.');
    } else {
      router.push('/hesabim');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Üye Kayıt / Üye Girişi Sekmeleri (Görsel 1-2 İle Birebir) */}
          <div className="flex border-b border-gray-200 mb-8">
            <span className="w-1/2 pb-3 text-center text-sm font-extrabold text-emerald-600 border-b-2 border-emerald-600 uppercase tracking-wider">
              ÜYE KAYIT
            </span>
            <Link
              href="/hesabim/giris"
              className="w-1/2 pb-3 text-center text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
            >
              ÜYE GİRİŞİ
            </Link>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Ad & Soyad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ad *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Zehra"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Koç"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Cep Telefonu (+90 Bayrak) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cep Telefonu *
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">
                  🇹🇷 +90
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="553 272 38 58"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* E-posta Adresi */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                E-posta Adresi *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fkoc899@gmail.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Şifre *
              </label>
              <div className="relative">
                <input
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

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Şifre Tekrar *
              </label>
              <div className="relative">
                <input
                  type={showPassConfirm ? 'text' : 'password'}
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassConfirm(!showPassConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Onay Kutucukları (Görsel 1 Birebir Metinler) */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotice}
                  onChange={(e) => setEmailNotice(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">Ticari Elektronik İleti Onayı</strong> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek bilgilendirme e-postalarını almak istiyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotice}
                  onChange={(e) => setSmsNotice(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">Ticari Elektronik İleti Onayı</strong> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek bilgilendirme sms'lerini almak istiyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={callNotice}
                  onChange={(e) => setCallNotice(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">Ticari Elektronik İleti Onayı</strong> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek bilgilendirme aramalarını almak istiyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgree}
                  onChange={(e) => setTermsAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">Üyelik Sözleşmesi'ni</strong> okudum ve kabul ediyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kvkkAgree}
                  onChange={(e) => setKvkkAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">KVKK Sözleşmesi'ni</strong> okudum ve kabul ediyorum.
                </span>
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-200 font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* KAYIT OL Butonu */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider"
              >
                {loading ? 'Kayıt Yapılıyor...' : 'KAYIT OL'}
              </button>
            </div>

            {/* Ve Ya Sepatörü & Sosyal Giriş (Görsel 1 Birebir) */}
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
                  f KAYIT OL
                </button>
                <button
                  type="button"
                  onClick={() => signIn('credentials', { redirect: false, email: 'google_user@onbsaglik.com', password: 'demoPassword123' })}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  <span className="text-blue-500 font-black">G</span> KAYIT OL
                </button>
                <button
                  type="button"
                  onClick={() => signIn('credentials', { redirect: false, email: 'apple_user@onbsaglik.com', password: 'demoPassword123' })}
                  className="flex items-center justify-center gap-2 bg-black text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                   KAYIT OL
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
