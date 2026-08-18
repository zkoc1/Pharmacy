'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, FileText, X } from 'lucide-react';

export default function KayitPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const [emailNotice, setEmailNotice] = useState(true);
  const [smsNotice, setSmsNotice] = useState(true);
  const [callNotice, setCallNotice] = useState(true);
  const [termsAgree, setTermsAgree] = useState(true);
  const [kvkkAgree, setKvkkAgree] = useState(true);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<{ title: string; content: string } | null>(null);

  const router = useRouter();

  const legalTexts = {
    ticariIleti: {
      title: 'Ticari Elektronik İleti Onayı Aydınlatma Metni',
      content:
        'OnbSağlık İnternet Mağazacılık San. ve Tic. A.Ş. Ticari İletişime İlişkin Açık Rıza Metni\n\nİşbu bildirim uyarınca OnbSağlık tarafından yürütülen pazarlama faaliyetleri kapsamında, tarafıma indirim, kampanya, teklif ve tanıtım e-postaları, SMS ve sesli aramalar yapılmasına izin veriyorum. İletişim tercihlerimi dilediğim zaman profilden değiştirebilirim.',
    },
    uyelik: {
      title: 'Üyelik Sözleşmesi',
      content:
        'OnbSağlık Müşteri Üyelik Sözleşmesi uyarınca, üyelik bilgileri gizli tutulacak ve sipariş adımlarında güvenli alışveriş standartlarına uygun olarak işlenecektir.',
    },
    kvkk: {
      title: 'KVKK Aydınlatma Metni',
      content:
        '6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca kişisel verileriniz OnbSağlık tarafından güvenli sunucularda saklanmakta ve üçüncü kişilerle izinsiz paylaşılmamaktadır.',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (!termsAgree || !kvkkAgree) {
      setError('Lütfen Üyelik Sözleşmesi ve KVKK metnini onaylayın.');
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    localStorage.setItem('user_session', JSON.stringify({ email: cleanEmail, name: `${firstName} ${lastName}`, role: 'customer' }));

    const res = await signIn('credentials', {
      redirect: false,
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('Kayıt oluşturulurken bir hata oluştu.');
    } else {
      router.push('/hesabim');
      router.refresh();
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      if (provider === 'google') {
        window.open(
          'https://accounts.google.com/o/oauth2/v2/auth?client_id=824105571389-dummy.apps.googleusercontent.com&redirect_uri=https://onbsaglik.com/api/auth/callback/google&response_type=code&scope=openid%20email%20profile',
          'GoogleSignIn',
          'width=500,height=600'
        );
      } else if (provider === 'facebook') {
        window.open('https://www.facebook.com/v18.0/dialog/oauth?client_id=dummy_app_id&redirect_uri=https://onbsaglik.com/api/auth/callback/facebook', 'FacebookSignIn', 'width=600,height=700');
      } else if (provider === 'apple') {
        window.open('https://appleid.apple.com/auth/authorize?client_id=com.onbsaglik.web&redirect_uri=https://onbsaglik.com/api/auth/callback/apple&response_type=code', 'AppleSignIn', 'width=600,height=700');
      }

      localStorage.setItem('user_session', JSON.stringify({ email: `${provider}_user@onbsaglik.com`, name: `${provider.toUpperCase()} Kullanıcısı`, role: 'customer' }));
      await signIn('credentials', { redirect: false, email: `${provider}_user@onbsaglik.com`, password: 'demoPassword123' });
      setTimeout(() => router.push('/hesabim'), 1500);
    } catch {
      await signIn('credentials', { redirect: false, email: `${provider}_user@onbsaglik.com`, password: 'demoPassword123' });
      router.push('/hesabim');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Üye Kayıt / Üye Girişi Sekmeleri */}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ad *</label>
                <input
                  type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Zehra" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Soyad *</label>
                <input
                  type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                  placeholder="Koç" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Cep Telefonu */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cep Telefonu *</label>
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">
                  🇹🇷 +90
                </span>
                <input
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="553 272 38 58" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">E-posta Adresi *</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="fkoc899@gmail.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Şifre *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Şifre Tekrar *</label>
              <div className="relative">
                <input
                  type={showPassConfirm ? 'text' : 'password'} required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Onay Kutucukları VE Tıklanabilir Metin Popupları (Görsel 1-2 Birebir) */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={emailNotice} onChange={(e) => setEmailNotice(e.target.checked)} className="mt-0.5 h-4 w-4 text-emerald-600 rounded" />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <button type="button" onClick={() => setActiveLegalModal(legalTexts.ticariIleti)} className="underline font-bold text-gray-800 hover:text-emerald-600">
                    Ticari Elektronik İleti Onayı
                  </button> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek bilgilendirme e-postalarını almak istiyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={smsNotice} onChange={(e) => setSmsNotice(e.target.checked)} className="mt-0.5 h-4 w-4 text-emerald-600 rounded" />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <button type="button" onClick={() => setActiveLegalModal(legalTexts.ticariIleti)} className="underline font-bold text-gray-800 hover:text-emerald-600">
                    Ticari Elektronik İleti Onayı
                  </button> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek bilgilendirme sms'lerini almak istiyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={callNotice} onChange={(e) => setCallNotice(e.target.checked)} className="mt-0.5 h-4 w-4 text-emerald-600 rounded" />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <button type="button" onClick={() => setActiveLegalModal(legalTexts.ticariIleti)} className="underline font-bold text-gray-800 hover:text-emerald-600">
                    Ticari Elektronik İleti Onayı
                  </button> metnini okudum, onaylıyorum. Tarafınızdan gönderilecek bilgilendirme arama'larını almak istiyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={termsAgree} onChange={(e) => setTermsAgree(e.target.checked)} className="mt-0.5 h-4 w-4 text-emerald-600 rounded" />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <button type="button" onClick={() => setActiveLegalModal(legalTexts.uyelik)} className="underline font-bold text-gray-800 hover:text-emerald-600">
                    Üyelik Sözleşmesi'ni
                  </button> okudum ve kabul ediyorum.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={kvkkAgree} onChange={(e) => setKvkkAgree(e.target.checked)} className="mt-0.5 h-4 w-4 text-emerald-600 rounded" />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <button type="button" onClick={() => setActiveLegalModal(legalTexts.kvkk)} className="underline font-bold text-gray-800 hover:text-emerald-600">
                    KVKK Sözleşmesi'ni
                  </button> okudum ve kabul ediyorum.
                </span>
              </label>
            </div>

            {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-200 font-semibold">⚠️ {error}</div>}

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md text-sm uppercase tracking-wider">
                {loading ? 'Kayıt Yapılıyor...' : 'KAYIT OL'}
              </button>
            </div>

            {/* Sosyal Giriş Butonları (Görsel 1, 2, 3 Birebir OAuth Pencereleri) */}
            <div className="pt-6 text-center">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-4 text-xs font-bold text-gray-400">veya</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('facebook')}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  f ile bağlan
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('google')}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  <span className="text-blue-500 font-black">G</span> ile bağlan
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('apple')}
                  className="flex items-center justify-center gap-2 bg-black text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                   ile bağlan
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* SÖZLEŞME AÇIK RIZA MODALİ */}
      {activeLegalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveLegalModal(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4 text-emerald-800 font-extrabold text-base border-b pb-3">
              <FileText size={24} className="text-emerald-600" />
              {activeLegalModal.title}
            </div>
            <div className="text-xs text-gray-600 leading-relaxed max-h-80 overflow-y-auto pr-2">
              {activeLegalModal.content}
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setActiveLegalModal(null)} className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                ANLADIM, KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
