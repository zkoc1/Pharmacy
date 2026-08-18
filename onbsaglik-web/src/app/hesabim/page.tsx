'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, ShoppingBag, LogOut, ShieldCheck, MapPin } from 'lucide-react';

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Giriş yapılmamışsa giriş sayfasına yönlendir
    if (status === 'unauthenticated') {
      router.push('/hesabim/giris');
    }

    // Admin oturum kontrolü
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const parsed = JSON.parse(adminSession);
        if (parsed.role === 'super_admin' || parsed.role === 'admin') {
          setIsAdminLoggedIn(true);
        }
      } catch {}
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg font-medium">Hesap bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Üst Profil Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User size={28} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.user?.name || 'Değerli Müşterimiz'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Müşteri Hesabı
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {session.user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/hesabim/giris' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>

        {/* Hızlı Erişim Menüsü */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/sepet"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Alışveriş Sepeti</h3>
              <p className="text-xs text-gray-500">Sepetinizdeki ürünleri inceleyin</p>
            </div>
          </Link>

          <Link
            href="/favoriler"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Favorilerim</h3>
              <p className="text-xs text-gray-500">Beğendiğiniz ürünlerin listesi</p>
            </div>
          </Link>

          <div
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 opacity-75"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Adres Bilgileri</h3>
              <p className="text-xs text-gray-500">Sipariş teslimat adresleri</p>
            </div>
          </div>
        </div>

        {/* Sipariş Geçmişi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Sipariş Geçmişim</h2>
          </div>
          <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">Henüz geçmiş siparişiniz bulunmamaktadır.</p>
            <p className="text-xs text-gray-400 mt-1">Verdiğiniz tüm siparişler bu alanda listelenecektir.</p>
            <Link href="/urunler" className="inline-block mt-4 text-xs font-bold text-emerald-600 hover:underline">
              Hemen Alışverişe Başla &rarr;
            </Link>
          </div>
        </div>

        {/* Sadece Admin Yetkisine Sahip Kullanıcılar İçin Geçiş Alanı */}
        {isAdminLoggedIn && (
          <div className="p-4 bg-emerald-900 text-white rounded-2xl flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-amber-400" />
              <div>
                <p className="font-bold text-sm">Yönetici Oturumu Açık</p>
                <p className="text-xs text-emerald-200">Super Admin yetkileriyle sisteme bağlısınız.</p>
              </div>
            </div>
            <Link href="/admin" className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-xs transition-colors">
              Admin Paneline Geç &rarr;
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
