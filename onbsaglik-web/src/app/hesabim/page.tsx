'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  Heart,
  Gift,
  MapPin,
  MessageSquare,
  Bell,
  CreditCard,
  Tag,
  UserX,
  LayoutDashboard,
  UserCheck,
  LogOut,
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useAddressStore } from '@/stores/addressStore';
import { useOrderStore, OrderRecord } from '@/stores/orderStore';
import { formatPrice } from '@/lib/products';

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderSearchResult, setOrderSearchResult] = useState<string | null>(null);

  const [isAdminUser, setIsAdminUser] = useState(false);

  // Adres ve Sipariş Store'ları
  const { addresses, addAddress, removeAddress } = useAddressStore();
  const { orders } = useOrderStore();

  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    fullAddress: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const [bankNotice, setBankNotice] = useState({ orderId: '', bank: 'Ziraat Bankası', senderName: '', amount: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/hesabim/giris');
      return;
    }

    // YANLIZCA GERÇEK ADMİN HESAPLARI YÖNETİCİ PANELİNİ GÖREBİLİR
    const currentUserEmail = session?.user?.email;
    const adminSessionRaw = localStorage.getItem('admin_session');

    if (currentUserEmail === 'admin@onbsaglik.com') {
      setIsAdminUser(true);
    } else if (adminSessionRaw) {
      try {
        const parsed = JSON.parse(adminSessionRaw);
        if (parsed.email === currentUserEmail && (parsed.role === 'admin' || parsed.role === 'super_admin')) {
          setIsAdminUser(true);
        } else {
          setIsAdminUser(false);
        }
      } catch {
        setIsAdminUser(false);
      }
    } else {
      setIsAdminUser(false);
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Hesap yükleniyor...</div>;
  }

  if (!session) return null;

  const userName = session.user?.name || (isAdminUser ? 'Sistem Yöneticisi' : 'Müşteri');
  const userEmail = session.user?.email || 'kullanici@onbsaglik.com';

  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const found = orders.find((o) => o.id.toLowerCase() === orderQuery.trim().toLowerCase());
    if (found) {
      setOrderSearchResult(`Sipariş Bulundu: ${found.id} — Durum: ${found.status} — Toplam: ${formatPrice(found.total)}`);
    } else {
      setOrderSearchResult(`"${orderQuery}" numaralı sipariş sorgulandı: Hazırlanıyor / Kargoya Verilecek.`);
    }
  };

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
    setShowAddrForm(false);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMsg(`"${couponCode.toUpperCase()}" kupon kodu hesabınıza tanımlandı! 🎉`);
    setCouponCode('');
  };

  const dashboardCards = [
    { id: 'siparislerim', title: 'SİPARİŞLERİM', icon: ShoppingBag, color: 'text-emerald-600', badge: orders.length },
    { id: 'favorilerim', title: 'FAVORİLERİM', icon: Heart, color: 'text-rose-500', link: '/favoriler' },
    { id: 'hediye-ceklerim', title: 'HEDİYE ÇEKLERİM', icon: Gift, color: 'text-amber-500' },
    { id: 'adreslerim', title: 'ADRESLERİM', icon: MapPin, color: 'text-blue-500', badge: addresses.length },
    { id: 'yorumlarim', title: 'YORUMLARIM', icon: MessageSquare, color: 'text-purple-500' },
    { id: 'stok-alarm', title: 'STOK ALARM LİSTEM', icon: Bell, color: 'text-indigo-500' },
    { id: 'havale-bildirimi', title: 'HAVALE BİLDİRİMİ', icon: CreditCard, color: 'text-teal-500' },
    { id: 'fiyat-alarm', title: 'FİYAT ALARM LİSTEM', icon: Tag, color: 'text-orange-500' },
    { id: 'uyelik-iptali', title: 'ÜYELİK İPTALİ', icon: UserX, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 font-sans">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sol Profil Kartı & Gezinme */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100 shadow-inner">
                <User size={48} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">{userName}</h2>
              <p className="text-xs text-gray-500 font-medium mt-1 mb-4">{userEmail}</p>

              {/* YALNIZCA GERÇEK ADMİN KULLANICISINA YÖNETİCİ PANELİ GEÇİŞİ GÖSTERİLİR */}
              {isAdminUser && (
                <div className="mb-4">
                  <Link
                    href="/admin"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <ShieldCheck size={16} /> YÖNETİCİ PANELİNE GEÇ &rarr;
                  </Link>
                </div>
              )}

              <div className="space-y-2 border-t border-gray-100 pt-4 text-left">
                <Link
                  href="/hesabim"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs"
                >
                  <LayoutDashboard size={16} /> HESABIM
                </Link>
                <Link
                  href="/hesabim/kisisel-bilgiler"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-xs transition-colors"
                >
                  <UserCheck size={16} /> KİŞİSEL BİLGİLERİM
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                >
                  <LogOut size={16} /> ÇIKIŞ
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* YALNIZCA GERÇEK ADMİN İÇİN ÜST UYARI BANNERİ */}
            {isAdminUser && (
              <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-400/20 text-amber-400 rounded-2xl border border-amber-400/30">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-amber-400">Yönetici Yetkisi Tanımlı</h3>
                    <p className="text-xs text-gray-300">Sistem yöneticisi olarak oturum açtınız. Yönetim panelinden ürün, stok ve kampanya yönetebilirsiniz.</p>
                  </div>
                </div>
                <Link href="/admin" className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap">
                  Admin Paneli &rarr;
                </Link>
              </div>
            )}

            {/* Sipariş Takip Arama Çubuğu */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag size={16} className="text-emerald-600" /> SİPARİŞ TAKİP
              </h3>
              <form onSubmit={handleOrderSearch} className="flex gap-2">
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Sipariş Numarası :"
                  className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl text-xs transition-colors"
                >
                  ARA
                </button>
              </form>
              {orderSearchResult && (
                <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
                  {orderSearchResult}
                </div>
              )}
            </div>

            {/* 9'lu Kart Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dashboardCards.map((card) => {
                const IconComponent = card.icon;
                if (card.link) {
                  return (
                    <Link
                      key={card.id}
                      href={card.link}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                    >
                      <div className={`p-4 rounded-2xl bg-gray-50 ${card.color} mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent size={28} />
                      </div>
                      <span className="text-xs font-extrabold text-gray-800 group-hover:text-emerald-600 transition-colors">
                        {card.title}
                      </span>
                    </Link>
                  );
                }
                return (
                  <button
                    key={card.id}
                    onClick={() => setActiveModal(card.id)}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative"
                  >
                    {card.badge !== undefined && card.badge > 0 && (
                      <span className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {card.badge}
                      </span>
                    )}
                    <div className={`p-4 rounded-2xl bg-gray-50 ${card.color} mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent size={28} />
                    </div>
                    <span className="text-xs font-extrabold text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {card.title}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </div>

      {/* DİNAMİK MÜŞTERİ SİPARİŞLERİ MODALİ */}
      {activeModal === 'siparislerim' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" /> Sipariş Geçmişim ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 py-8 text-center">Henüz bir siparişiniz bulunmamaktadır.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2 text-xs">
                      <span className="font-extrabold text-gray-900">{ord.id}</span>
                      <span className="text-gray-500 font-semibold">{ord.date}</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-md">{ord.status}</span>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-800">{it.name} (x{it.quantity})</span>
                          <span className="font-extrabold text-emerald-600">{formatPrice(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 text-xs">
                      <span className="text-gray-500 font-bold">Ödeme Yöntemi: {ord.paymentMethod}</span>
                      <span className="text-sm font-extrabold text-rose-500">Toplam: {formatPrice(ord.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADRESLERİM MODALİ */}
      {activeModal === 'adreslerim' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Kayıtlı Adreslerim ({addresses.length})
              </h3>
              <button onClick={() => setShowAddrForm(!showAddrForm)} className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Plus size={14} /> Yeni Adres
              </button>
            </div>

            {showAddrForm && (
              <form onSubmit={handleAddAddressSubmit} className="bg-gray-50 p-4 rounded-2xl space-y-2 border">
                <input type="text" placeholder="Adres Başlığı (Örn: Ev, İş)" required value={newAddr.title} onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })} className="w-full p-2 border rounded-xl text-xs bg-white" />
                <input type="text" placeholder="Ad Soyad" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} className="w-full p-2 border rounded-xl text-xs bg-white" />
                <input type="text" placeholder="Telefon" required value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className="w-full p-2 border rounded-xl text-xs bg-white" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="İl" required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="p-2 border rounded-xl text-xs bg-white" />
                  <input type="text" placeholder="İlçe" required value={newAddr.district} onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })} className="p-2 border rounded-xl text-xs bg-white" />
                </div>
                <textarea placeholder="Açık Adres" required value={newAddr.fullAddress} onChange={(e) => setNewAddr({ ...newAddr, fullAddress: e.target.value })} className="w-full p-2 border rounded-xl text-xs bg-white" rows={2} />
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs">Kaydet</button>
              </form>
            )}

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-start text-xs">
                  <div>
                    <span className="font-extrabold text-gray-900 block">{addr.title} {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1">Varsayılan</span>}</span>
                    <p className="font-semibold text-gray-700 mt-1">{addr.fullName} — {addr.phone}</p>
                    <p className="text-gray-500 mt-1">{addr.fullAddress} ({addr.district} / {addr.city})</p>
                  </div>
                  <button onClick={() => removeAddress(addr.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DİĞER MODALLAR (HEDİYE ÇEKLERİM, HAVALE BİLDİRİMİ VB.) */}
      {activeModal === 'hediye-ceklerim' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <Gift className="text-amber-500" /> Hediye Çeki Tanımla
            </h3>
            <form onSubmit={handleCouponSubmit} className="space-y-3">
              <input type="text" placeholder="Hediye Çeki veya Kupon Kodu" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full p-3 border rounded-xl text-xs bg-gray-50 uppercase font-bold" />
              {couponMsg && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl">{couponMsg}</p>}
              <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl text-xs">TANIMLA</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
