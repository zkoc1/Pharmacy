'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, ShoppingBag, LogOut, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAddressStore, Address } from '@/stores/addressStore';

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Adres Yönetimi Store
  const { addresses, addAddress, removeAddress } = useAddressStore();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    fullAddress: '',
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg font-medium">Hesap bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') router.push('/hesabim/giris');
    return null;
  }

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.title || !newAddr.fullName || !newAddr.fullAddress) return;

    addAddress({
      title: newAddr.title,
      fullName: newAddr.fullName,
      phone: newAddr.phone,
      city: newAddr.city,
      district: newAddr.district,
      fullAddress: newAddr.fullAddress,
      isDefault: addresses.length === 0,
    });

    setNewAddr({ title: '', fullName: '', phone: '', city: '', district: '', fullAddress: '' });
    setShowAddressForm(false);
  };

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

          <a
            href="#adresler"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Adres Bilgilerim</h3>
              <p className="text-xs text-gray-500">Kayıtlı teslimat adresleriniz</p>
            </div>
          </a>
        </div>

        {/* AKTİF ADRES BİLGİLERİ BÖLÜMÜ */}
        <div id="adresler" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Kayıtlı Teslimat Adreslerim ({addresses.length})</h2>
            </div>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={16} /> Yeni Adres Ekle
            </button>
          </div>

          {/* Adres Ekleme Formu */}
          {showAddressForm && (
            <form onSubmit={handleAddAddressSubmit} className="bg-blue-50/50 border border-blue-200 p-5 rounded-xl mb-6">
              <h3 className="font-bold text-sm text-blue-900 mb-4">Yeni Teslimat Adresi Tanımla</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Adres Başlığı *</label>
                  <input
                    type="text" required value={newAddr.title} onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                    placeholder="Evim, İş Yeri, Yazlık vb."
                    className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teslim Alacak Ad Soyad *</label>
                  <input
                    type="text" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    placeholder="Ahmet Yılmaz"
                    className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="text" required value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    placeholder="05XXXXXXXXX"
                    className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Şehir / İlçe *</label>
                  <div className="flex gap-2">
                    <input
                      type="text" required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      placeholder="İstanbul"
                      className="w-1/2 p-2.5 border rounded-lg text-xs bg-white focus:ring-blue-500"
                    />
                    <input
                      type="text" required value={newAddr.district} onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                      placeholder="Kadıköy"
                      className="w-1/2 p-2.5 border rounded-lg text-xs bg-white focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Açık Adres (Mahalle, Cadde, Bina/Daire No) *</label>
                  <textarea
                    required rows={2} value={newAddr.fullAddress} onChange={(e) => setNewAddr({ ...newAddr, fullAddress: e.target.value })}
                    placeholder="Caferağa Mah. Moda Cad. No:12 D:4"
                    className="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Kaydet</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">İptal</button>
              </div>
            </form>
          )}

          {/* Adres Listesi */}
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">Kayıtlı adresiniz bulunmuyor.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-start relative">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Varsayılan
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{addr.fullName} · {addr.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">{addr.fullAddress}</p>
                    <p className="text-xs text-gray-400 font-medium">{addr.district} / {addr.city}</p>
                  </div>
                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Adresi Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
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

      </div>
    </div>
  );
}
