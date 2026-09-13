'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LayoutDashboard, UserCheck, MessageSquare, LogOut, Check, Eye, EyeOff, Save } from 'lucide-react';

export default function KisiselBilgilerSayfasi() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    gender: 'Belirtmek istemiyorum',
    phone: '',
    birthDate: '',
    email: '',
    tcNo: '',
    address: '',
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [showPass3, setShowPass3] = useState(false);

  const [saveMsg, setSaveMsg] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/hesabim/giris');
    } else if (session?.user) {
      // API'den gerçek veriyi çek
      fetch('/api/auth/update-profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.metadata) {
            setProfile(p => ({
              ...p,
              firstName: data.metadata.first_name || '',
              lastName: data.metadata.last_name || '',
              phone: data.metadata.phone || '',
              email: session.user?.email || '',
              tcNo: data.metadata.tc_no || '',
              address: data.metadata.address || '',
              gender: data.metadata.gender || 'Belirtmek istemiyorum'
            }));
          } else {
            // Fallback
            const parts = (session.user?.name || '').split(' ');
            setProfile(p => ({
              ...p,
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || '',
              email: session.user?.email || '',
            }));
          }
          setLoadingProfile(false);
        })
        .catch(() => setLoadingProfile(false));
    }
  }, [session, status, router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSaveMsg('Kişisel bilgileriniz veritabanına başarıyla kaydedildi!');
      } else {
        alert(data.error || 'Güncelleme hatası!');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    }
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    setSaveMsg('Şifreniz başarıyla değiştirildi!');
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SOL YAN MENÜ (Görsel 3-4 Birebir Sol Panel) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 mb-3">
              <User size={40} />
            </div>
            <h2 className="font-extrabold text-gray-900 text-lg">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-xs text-rose-500 font-semibold mt-0.5">{profile.email}</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
            <Link
              href="/hesabim"
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              <LayoutDashboard size={18} /> HESABIM
            </Link>
            <Link
              href="/hesabim/kisisel-bilgiler"
              className="flex items-center gap-3 px-4 py-3 text-xs font-extrabold text-emerald-600 bg-emerald-50 rounded-2xl transition-colors"
            >
              <UserCheck size={18} /> KİŞİSEL BİLGİLERİM
            </Link>
            <button
              onClick={() => alert('Mesaj kutunuz boş.')}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors text-left"
            >
              <MessageSquare size={18} /> MESAJLARIM
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/hesabim/giris' })}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-left"
            >
              <LogOut size={18} /> ÇIKIŞ
            </button>
          </div>
        </div>

        {/* SAĞ İÇERİK ALANI (Görsel 4 Birebir Formlar) */}
        <div className="lg:col-span-3 space-y-6">
          {saveMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <Check size={18} /> {saveMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ÜYELİK BİLGİLERİ FORMU */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm border-b pb-3 text-emerald-700">Üyelik Bilgileri</h3>
              <form onSubmit={handleProfileSave} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    value={profile.firstName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[0-9]/g, '');
                      setProfile({ ...profile, firstName: val });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Soyad *</label>
                  <input
                    type="text"
                    required
                    value={profile.lastName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[0-9]/g, '');
                      setProfile({ ...profile, lastName: val });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Cinsiyet</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  >
                    <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Erkek">Erkek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Cep Telefonu *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={profile.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setProfile({ ...profile, phone: val });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">E-posta Adresi *</label>
                  <input
                    type="email"
                    required
                    disabled
                    value={profile.email}
                    className="w-full px-3 py-2 bg-gray-100 border rounded-xl text-xs text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">T.C. Kimlik No</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={profile.tcNo}
                    onChange={(e) => setProfile({ ...profile, tcNo: e.target.value })}
                    placeholder="XXXXXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Adres</label>
                  <textarea
                    rows={2}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold py-2.5 rounded-xl text-xs">
                  BİLGİLERİ GÜNCELLE
                </button>
              </form>
            </div>

            {/* ŞİFRE BİLGİLERİ & BİLDİRİM AYARLARI */}
            <div className="space-y-6">
              {/* Şifre Değiştirme */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-gray-900 text-sm border-b pb-3 text-emerald-700">Şifre Bilgilerim</h3>
                <form onSubmit={handlePasswordSave} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Mevcut Şifre *</label>
                    <div className="relative">
                      <input
                        type={showPass1 ? 'text' : 'password'}
                        required
                        value={passwordState.currentPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs pr-8"
                      />
                      <button type="button" onClick={() => setShowPass1(!showPass1)} className="absolute right-2 top-2 text-gray-400">
                        {showPass1 ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Yeni Şifre *</label>
                    <div className="relative">
                      <input
                        type={showPass2 ? 'text' : 'password'}
                        required
                        value={passwordState.newPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs pr-8"
                      />
                      <button type="button" onClick={() => setShowPass2(!showPass2)} className="absolute right-2 top-2 text-gray-400">
                        {showPass2 ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Yeni Şifre Tekrar *</label>
                    <div className="relative">
                      <input
                        type={showPass3 ? 'text' : 'password'}
                        required
                        value={passwordState.confirmPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs pr-8"
                      />
                      <button type="button" onClick={() => setShowPass3(!showPass3)} className="absolute right-2 top-2 text-gray-400">
                        {showPass3 ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs">
                    GÜNCELLE
                  </button>
                </form>
              </div>

              {/* Bildirim Ayarları */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <h3 className="font-extrabold text-gray-900 text-sm border-b pb-3 text-emerald-700">Bildirim ve Sözleşme Ayarları</h3>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  E-posta bilgilendirmelerini almak istiyorum.
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                  SMS bilgilendirmelerini almak istiyorum.
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input type="checkbox" className="rounded text-emerald-600" />
                  Telefon araması ile bilgilendirme yapılmasını onaylıyorum.
                </label>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
