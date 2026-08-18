'use client';

import React, { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Giriş yapılmamışsa giriş sayfasına yönlendir
    if (status === 'unauthenticated') {
      router.push('/hesabim/giris');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Yükleniyor...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Yönlendirme gerçekleşene kadar bir şey gösterme
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Üst Kısım: Karşılama ve Çıkış */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Merhaba {session.user?.name}!
            </h1>
            <p className="mt-1 text-gray-600">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/hesabim/giris' })}
            className="mt-4 sm:mt-0 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Sipariş Geçmişi */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sipariş Geçmişi</h2>
          <div className="text-gray-500 text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
            Henüz geçmiş siparişiniz bulunmamaktadır.
          </div>
        </div>

        {/* Admin Linki (Mevcut yapıdan korundu) */}
        <div className="mt-8 p-4 bg-[#2E7D32] bg-opacity-10 rounded-lg border border-[#2E7D32] border-opacity-20 flex justify-between items-center">
          <p className="text-[#1B5E20]">Yetkili erişimi:</p>
          <Link href="/admin/giris" className="text-[#2E7D32] font-semibold hover:underline">
            Admin Paneline Git &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
