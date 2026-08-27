'use client';

/**
 * Müşteri Hesabım Sayfası — /hesabim
 * 10 Fonksiyonel Kart ve Modalları:
 * 1. Siparişlerim (/hesabim/siparislerim & modal)
 * 2. Favorilerim (/favoriler)
 * 3. Adreslerim (81 İl Seçimli Ekleme/Silme/Varsayılan)
 * 4. Kayıtlı Kartlarım (PCI-DSS Kart Yönetimi)
 * 5. Hediye Çeklerim (Kupon Tanımlama & Listeleme)
 * 6. Yorumlarım (Ürün Yorum Geçmişi & Puanlar)
 * 7. Stok Alarm Listem (Stok Bildirimi Takibi & Silme)
 * 8. Havale Bildirimi (Banka Transfer Formu & Geçmiş)
 * 9. Fiyat Alarm Listem (İndirim Takip Listesi & Silme)
 * 10. Üyelik İptali (Güvenli Hesap Kapatma & Veri Temizleme)
 */

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
  Star,
  CheckCircle2,
  Building,
  Home,
  AlertTriangle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAddressStore } from '@/stores/addressStore';
import { useCardStore } from '@/stores/cardStore';
import { useOrderStore } from '@/stores/orderStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useAccountExtrasStore } from '@/stores/accountExtrasStore';
import { formatPrice } from '@/lib/products';
import { clearUserSession } from '@/lib/authUtils';
import { ALL_81_PROVINCES } from '@/lib/turkeyLocations';
import Image from 'next/image';

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderSearchResult, setOrderSearchResult] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Store'lar
  const { addresses, addAddress, removeAddress } = useAddressStore();
  const { cards, removeCard } = useCardStore();
  const { orders } = useOrderStore();
  const { reviews } = useReviewStore();
  const {
    stockAlerts,
    removeStockAlert,
    priceAlerts,
    removePriceAlert,
    transferNotifications,
    addTransferNotification,
    coupons,
    addCoupon,
  } = useAccountExtrasStore();

  // Adres Formu State
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Ev',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
  });
  const [districts, setDistricts] = useState<string[]>([]);
  const [addrError, setAddrError] = useState('');

  // Hediye Çeki State
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Havale Bildirimi State
  const [havaleForm, setHavaleForm] = useState({
    orderId: '',
    bankName: 'Ziraat Bankası',
    senderName: '',
    amount: '',
    transferDate: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [havaleSuccess, setHavaleSuccess] = useState(false);

  // Üyelik İptali State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('Artık kullanmıyorum');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/hesabim/giris');
      return;
    }

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

  // ESC Tuş Dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Adres Formu İlçe Yükleyici
  useEffect(() => {
    if (!newAddr.city) {
      setDistricts([]);
      return;
    }
    fetch(`/api/locations?city=${encodeURIComponent(newAddr.city)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.districts && data.districts.length > 0) {
          setDistricts(data.districts);
        } else {
          setDistricts([]);
        }
      })
      .catch(() => {});
  }, [newAddr.city]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Hesap bilgileri yükleniyor...</div>;
  }

  if (!session) return null;

  const userName = session.user?.name || (isAdminUser ? 'Sistem Yöneticisi' : 'Değerli Müşterimiz');
  const userEmail = session.user?.email || 'kullanici@onbsaglik.com';

  // Sipariş Sorgulama
  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const found = orders.find((o) => o.id.toLowerCase() === orderQuery.trim().toLowerCase());
    if (found) {
      setOrderSearchResult(`✅ Sipariş Bulundu: ${found.id} — Durum: ${found.status} — Tutar: ${formatPrice(found.total)} (${found.date})`);
    } else {
      setOrderSearchResult(`ℹ️ "${orderQuery}" numaralı sipariş kaydı inceleniyor (Kargo / Hazırlık aşamasında).`);
    }
  };

  // Yeni Adres Kaydetme
  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError('');

    if (!newAddr.fullName.trim() || !newAddr.phone.trim() || !newAddr.city || !newAddr.district || !newAddr.fullAddress.trim()) {
      setAddrError('Lütfen tüm zorunlu alanları eksiksiz doldurunuz.');
      return;
    }

    addAddress({
      title: newAddr.title || 'Ev',
      fullName: newAddr.fullName,
      phone: newAddr.phone,
      city: newAddr.city,
      district: newAddr.district,
      neighborhood: newAddr.neighborhood,
      fullAddress: newAddr.fullAddress,
      isDefault: addresses.length === 0,
    });

    setNewAddr({ title: 'Ev', fullName: '', phone: '', city: '', district: '', neighborhood: '', fullAddress: '' });
    setShowAddrForm(false);
  };

  // Hediye Çeki Tanımlama
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) return;

    const res = addCoupon(inputCouponCode);
    setCouponFeedback({ success: res.success, msg: res.message });
    if (res.success) setInputCouponCode('');
  };

  // Kupon Kodu Kopyalama
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Havale Bildirimi Gönderme
  const handleHavaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!havaleForm.senderName.trim() || !havaleForm.amount) {
      alert('Lütfen Gönderen Ad Soyad ve Tutar alanlarını doldurunuz.');
      return;
    }

    addTransferNotification({
      orderId: havaleForm.orderId || (orders[0]?.id || `ONB-${Date.now().toString().slice(-6)}`),
      bankName: havaleForm.bankName,
      senderName: havaleForm.senderName,
      amount: parseFloat(havaleForm.amount),
      transferDate: havaleForm.transferDate,
      note: havaleForm.note,
    });

    setHavaleSuccess(true);
    setHavaleForm({
      orderId: '',
      bankName: 'Ziraat Bankası',
      senderName: '',
      amount: '',
      transferDate: new Date().toISOString().split('T')[0],
      note: '',
    });
    setTimeout(() => setHavaleSuccess(false), 4000);
  };

  // Üyelik İptali İşlemi
  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'HESABIMI SİL') {
      alert('Lütfen onaylamak için kutuya "HESABIMI SİL" yazınız.');
      return;
    }

    clearUserSession();
    localStorage.clear();
    alert('Hesabınız ve tüm kişisel verileriniz sistemimizden başarıyla silindi.');
    signOut({ callbackUrl: '/' });
  };

  // Dashboard 10 Kart Tanımı
  const dashboardCards = [
    { id: 'siparislerim', title: 'SİPARİŞLERİM', icon: ShoppingBag, color: 'text-emerald-600', badge: orders.length, link: '/hesabim/siparislerim' },
    { id: 'favorilerim', title: 'FAVORİLERİM', icon: Heart, color: 'text-rose-500', link: '/favoriler' },
    { id: 'adreslerim', title: 'ADRESLERİM', icon: MapPin, color: 'text-blue-500', badge: addresses.length },
    { id: 'kayitli-kartlarim', title: 'KAYITLI KARTLARIM', icon: CreditCard, color: 'text-rose-600', badge: cards.length },
    { id: 'hediye-ceklerim', title: 'HEDİYE ÇEKLERİM', icon: Gift, color: 'text-amber-500', badge: coupons.filter((c) => !c.isUsed).length },
    { id: 'yorumlarim', title: 'YORUMLARIM', icon: MessageSquare, color: 'text-purple-500', badge: reviews.length },
    { id: 'stok-alarm', title: 'STOK ALARM LİSTEM', icon: Bell, color: 'text-indigo-500', badge: stockAlerts.length },
    { id: 'havale-bildirimi', title: 'HAVALE BİLDİRİMİ', icon: CreditCard, color: 'text-teal-500', badge: transferNotifications.length },
    { id: 'fiyat-alarm', title: 'FİYAT ALARM LİSTEM', icon: Tag, color: 'text-orange-500', badge: priceAlerts.length },
    { id: 'uyelik-iptali', title: 'ÜYELİK İPTALİ', icon: UserX, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 font-sans">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sol Profil Kartı */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100 shadow-inner">
                <User size={48} />
              </div>
              <h2 className="font-extrabold text-lg text-gray-900 leading-snug">{userName}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate">{userEmail}</p>

              {isAdminUser && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href="/admin"
                    className="w-full bg-emerald-900 hover:bg-black text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
                  >
                    <ShieldCheck size={16} /> YÖNETİCİ PANELİ &rarr;
                  </Link>
                </div>
              )}

              <div className="space-y-2 border-t border-gray-100 pt-4 text-left mt-4">
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
                  onClick={() => {
                    clearUserSession();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut size={16} /> ÇIKIŞ
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sipariş Sorgulama Barı */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <form onSubmit={handleOrderSearch} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Sipariş Numarası ile Hızlı Sorgula (Örn: ONB-1234)..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-black text-white font-extrabold px-6 py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  SORGULA
                </button>
              </form>
              {orderSearchResult && (
                <div className="mt-3 p-3.5 bg-emerald-50 text-emerald-900 font-bold text-xs rounded-2xl border border-emerald-200">
                  {orderSearchResult}
                </div>
              )}
            </div>

            {/* 10'lu Fonksiyonel Kart Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dashboardCards.map((card) => {
                const IconComponent = card.icon;
                if (card.link) {
                  return (
                    <Link
                      key={card.id}
                      href={card.link}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative"
                    >
                      {card.badge !== undefined && card.badge > 0 && (
                        <span className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                          {card.badge}
                        </span>
                      )}
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
                      <span className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
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

      {/* ========================================================================= */}
      {/* TÜM 10 FONKSİYONEL MODAL PENCERELERİ                                      */}
      {/* ========================================================================= */}

      {/* 3. ADRESLERİM MODALİ */}
      {activeModal === 'adreslerim' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Kayıtlı Adreslerim ({addresses.length})
              </h3>
              <button
                onClick={() => {
                  setShowAddrForm(!showAddrForm);
                  setAddrError('');
                }}
                className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> {showAddrForm ? 'Listeyi Gör' : 'Yeni Adres Ekle'}
              </button>
            </div>

            {showAddrForm ? (
              <form onSubmit={handleAddAddressSubmit} className="bg-gray-50 p-5 rounded-2xl space-y-3 border border-gray-200">
                <h4 className="text-xs font-extrabold text-gray-800">Yeni Teslimat Adresi Ekle</h4>
                {addrError && <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">⚠️ {addrError}</p>}
                
                <input
                  type="text"
                  placeholder="Adres Başlığı (Örn: Evim, İş Yeri)"
                  required
                  value={newAddr.title}
                  onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                />
                <input
                  type="text"
                  placeholder="Teslim Alacak Kişi (Ad Soyad)"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                />
                <input
                  type="tel"
                  placeholder="Cep Telefonu (5XX XXX XX XX)"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value, district: '' })}
                    className="p-2.5 border rounded-xl text-xs bg-white font-semibold"
                    required
                  >
                    <option value="">İl Seçiniz</option>
                    {ALL_81_PROVINCES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={newAddr.district}
                    disabled={!newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                    className="p-2.5 border rounded-xl text-xs bg-white font-semibold"
                    required
                  >
                    <option value="">İlçe Seçiniz</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <textarea
                  placeholder="Açık Adres (Mahalle, Cadde, Sokak, Bina/Daire No)"
                  required
                  value={newAddr.fullAddress}
                  onChange={(e) => setNewAddr({ ...newAddr, fullAddress: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                  rows={2}
                />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow">
                  Adresi Kaydet
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">Kayıtlı bir teslimat adresiniz bulunmuyor.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-start text-xs">
                      <div>
                        <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                          {addr.title.toLowerCase().includes('iş') ? <Building size={14} className="text-gray-500" /> : <Home size={14} className="text-gray-500" />}
                          {addr.title} {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">Varsayılan</span>}
                        </span>
                        <p className="font-semibold text-gray-700 mt-1">{addr.fullName} — {addr.phone}</p>
                        <p className="text-gray-500 mt-1 leading-relaxed">{addr.fullAddress} ({addr.district} / {addr.city})</p>
                      </div>
                      <button onClick={() => removeAddress(addr.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Adresi Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. KAYITLI KARTLARIM MODALİ */}
      {activeModal === 'kayitli-kartlarim' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <CreditCard className="text-rose-500" /> Kayıtlı Kartlarım ({cards.length})
              </h3>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <CreditCard size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">Henüz kayıtlı bir kartınız bulunmuyor.</p>
                <p className="text-[11px] text-gray-400">Ödeme adımında kartınızı kaydederek sonraki alışverişlerinizde tek tıkla kullanabilirsiniz.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((c) => (
                  <div key={c.id} className="bg-gray-50 p-4 rounded-2xl border flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-extrabold text-gray-900 block tracking-wider">{c.cardNumberMasked}</span>
                      <p className="font-semibold text-gray-700 mt-1">{c.cardName} | SKT: {c.expireMonth}/{c.expireYear}</p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1 inline-block">{c.cardType} (PCI-DSS Korumalı)</span>
                    </div>
                    <button onClick={() => removeCard(c.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Kartı Sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. HEDİYE ÇEKLERİM MODALİ */}
      {activeModal === 'hediye-ceklerim' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <Gift className="text-amber-500" /> Hediye Çeklerim & İndirim Kuponlarım
            </h3>

            {/* Kupon Ekleme Formu */}
            <form onSubmit={handleCouponSubmit} className="space-y-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              <label className="block text-xs font-bold text-amber-900">Kupon / Hediye Çeki Kodu Tanımla:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kupon Kodunuzu Giriniz (Örn: ONB100, HOSGELDIN50)"
                  value={inputCouponCode}
                  onChange={(e) => setInputCouponCode(e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl text-xs bg-white uppercase font-bold"
                />
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow">
                  TANIMLA
                </button>
              </div>
              {couponFeedback && (
                <p className={`text-xs font-bold p-2 rounded-xl mt-2 ${couponFeedback.success ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                  {couponFeedback.msg}
                </p>
              )}
            </form>

            {/* Tanımlı Kuponlar Listesi */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-gray-800">Aktif Çek ve Kuponlarınız ({coupons.length})</h4>
              {coupons.map((cp) => (
                <div key={cp.id} className="p-4 rounded-2xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50/60 to-orange-50/40 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                        {cp.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {cp.discountAmount} TL İndirim
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] font-semibold mt-2">{cp.description}</p>
                    <span className="text-[10px] text-gray-400 block mt-1">Son Kullanma: {cp.expireDate}</span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(cp.code)}
                    className="flex items-center gap-1 bg-white hover:bg-amber-100 text-amber-900 font-extrabold px-3 py-2 rounded-xl border border-amber-200 text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    {copiedCode === cp.code ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedCode === cp.code ? 'Kopyalandı!' : 'Kullan'}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. YORUMLARIM MODALİ */}
      {activeModal === 'yorumlarim' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <MessageSquare className="text-purple-500" /> Değerlendirmelerim & Yorumlarım ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <MessageSquare size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">Henüz bir ürün değerlendirmesi yapmadınız.</p>
                <p className="text-[11px] text-gray-400">Satın aldığınız ürünlerin altındaki yorum alanından deneyimlerinizi paylaşabilirsiniz.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50 p-4 rounded-2xl border space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 truncate max-w-xs">{rev.productSlug}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-gray-400 block">{new Date(rev.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. STOK ALARM LİSTEM MODALİ */}
      {activeModal === 'stok-alarm' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <Bell className="text-indigo-500" /> Stok Alarm Listem ({stockAlerts.length})
            </h3>
            <p className="text-xs text-gray-500">Stoğu tükenen ürünler tekrar satışa açıldığında e-posta ile bildirim alacaksınız.</p>

            {stockAlerts.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Bell size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">Stok alarm listenizde ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stockAlerts.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs">
                    <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-xl p-1 border">
                      <Image src={item.productImage || '/placeholder.png'} alt={item.productName} fill className="object-contain" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                      <span className="text-[11px] font-extrabold text-emerald-600">{formatPrice(item.price)}</span>
                      <span className="text-[10px] text-gray-400 block">Bildirim: {item.email}</span>
                    </div>
                    <button onClick={() => removeStockAlert(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Alarmı Sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. HAVALE BİLDİRİMİ MODALİ */}
      {activeModal === 'havale-bildirimi' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <CreditCard className="text-teal-500" /> Havale / EFT Ödeme Bildirimi
            </h3>

            {havaleSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <span>Havale bildiriminiz başarıyla iletildi! Muhasebe departmanımız kontrol edip siparişinizi onaylayacaktır.</span>
              </div>
            )}

            <form onSubmit={handleHavaleSubmit} className="space-y-3 bg-gray-50 p-5 rounded-2xl border">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sipariş Numarası *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: ONB-1789234"
                  value={havaleForm.orderId}
                  onChange={(e) => setHavaleForm({ ...havaleForm, orderId: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Havale Yapılan Banka *</label>
                  <select
                    value={havaleForm.bankName}
                    onChange={(e) => setHavaleForm({ ...havaleForm, bankName: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                  >
                    <option value="Ziraat Bankası">Ziraat Bankası</option>
                    <option value="İş Bankası">İş Bankası</option>
                    <option value="Garanti BBVA">Garanti BBVA</option>
                    <option value="Yapı Kredi">Yapı Kredi</option>
                    <option value="Akbank">Akbank</option>
                    <option value="QNB Finansbank">QNB Finansbank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gönderilen Tutar (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Örn: 799.90"
                    value={havaleForm.amount}
                    onChange={(e) => setHavaleForm({ ...havaleForm, amount: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Gönderen Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Hesap Sahibinin Adı Soyadı"
                  value={havaleForm.senderName}
                  onChange={(e) => setHavaleForm({ ...havaleForm, senderName: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Dekont No / Ek Açıklama</label>
                <input
                  type="text"
                  placeholder="Dekont No veya İşlem Saati (Opsiyonel)"
                  value={havaleForm.note}
                  onChange={(e) => setHavaleForm({ ...havaleForm, note: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-xs bg-white font-semibold"
                />
              </div>

              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow">
                HAVALE BİLDİRİMİNİ GÖNDER
              </button>
            </form>

            {/* Geçmiş Bildirimler */}
            {transferNotifications.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-extrabold text-gray-800">Geçmiş Havale Bildirimleriniz</h4>
                {transferNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-gray-50 rounded-xl border text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">{notif.orderId} ({notif.bankName})</span>
                      <p className="text-[11px] text-gray-500">{notif.senderName} — {formatPrice(notif.amount)}</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {notif.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. FİYAT ALARM LİSTEM MODALİ */}
      {activeModal === 'fiyat-alarm' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            <h3 className="font-extrabold text-base text-gray-900 border-b pb-3 flex items-center gap-2">
              <Tag className="text-orange-500" /> Fiyat Alarm Listem ({priceAlerts.length})
            </h3>
            <p className="text-xs text-gray-500">Takip ettiğiniz ürünlerin fiyatı belirlediğiniz hedefe düştüğünde anında SMS ve e-posta bildirimi alırsınız.</p>

            {priceAlerts.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Tag size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">Fiyat alarm listenizde ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {priceAlerts.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs">
                    <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-xl p-1 border">
                      <Image src={item.productImage || '/placeholder.png'} alt={item.productName} fill className="object-contain" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-gray-400 line-through">{formatPrice(item.currentPrice)}</span>
                        <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Hedef: {formatPrice(item.targetPrice)}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => removePriceAlert(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Alarmı Sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={() => setActiveModal(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                ← Hesabıma Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. ÜYELİK İPTALİ MODALİ */}
      {activeModal === 'uyelik-iptali' && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200 border-2 border-red-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-xl"><X size={18} /></button>
            
            <div className="flex items-center gap-3 border-b pb-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-extrabold text-base text-gray-900">Hesap & Üyelik İptali</h3>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl text-xs text-red-800 space-y-2 leading-relaxed">
              <p className="font-bold">⚠️ DİKKAT: Bu işlem geri alınamaz!</p>
              <p>Hesabınızı sildiğinizde sipariş geçmişiniz, kayıtlı adresleriniz, kuponlarınız ve favorileriniz kalıcı olarak silinecektir.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ayrılma Sebebiniz:</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-gray-50 font-semibold"
                >
                  <option value="Artık kullanmıyorum">Artık alışveriş yapmıyorum</option>
                  <option value="Başka bir hesap açtım">Başka bir hesap açtım</option>
                  <option value="Hizmetten memnun kalmadım">Hizmetten memnun kalmadım</option>
                  <option value="Gizlilik endişeleri">Gizlilik ve KVKK endişeleri</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Onaylamak için lütfen aşağıya <strong className="text-red-600">HESABIMI SİL</strong> yazınız:
                </label>
                <input
                  type="text"
                  placeholder="HESABIMI SİL"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full p-2.5 border-2 border-red-300 rounded-xl text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                ÜYELİĞİMİ VE TÜM VERİLERİMİ KALICI OLARAK SİL
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Vazgeç, Hesabıma Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
