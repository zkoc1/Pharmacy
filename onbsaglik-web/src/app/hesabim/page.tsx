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
} from 'lucide-react';
import { useAddressStore } from '@/stores/addressStore';

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderSearchResult, setOrderSearchResult] = useState<string | null>(null);

  const [isAdminUser, setIsAdminUser] = useState(false);

  // Adres Yönetimi Store
  const { addresses, addAddress, removeAddress } = useAddressStore();
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

    // Admin Oturum Kontrolü
    const adminSession = localStorage.getItem('admin_session');
    const currentUserEmail = session?.user?.email;

    if (currentUserEmail === 'admin@onbsaglik.com' || adminSession) {
      setIsAdminUser(true);
      if (!adminSession) {
        localStorage.setItem('admin_session', JSON.stringify({ email: 'admin@onbsaglik.com', role: 'super_admin' }));
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Hesap yükleniyor...</div>;
  }

  if (!session) return null;

  const userName = session.user?.name || (isAdminUser ? 'Sistem Yöneticisi' : 'Zehra Koç');
  const userEmail = session.user?.email || 'fkoc899@gmail.com';

  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setOrderSearchResult(`"${orderQuery}" numaralı sipariş sorgulandı: Siparişiniz hazırlanıyor / kargoya verilecek.`);
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
    if (couponCode.toUpperCase() === 'ONB100') {
      setCouponMsg('🎉 100 TL İndirim Kuponu Hesabınıza Tanımlandı!');
    } else {
      setCouponMsg('Geçersiz veya süresi dolmuş kupon kodu.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SOL YAN MENÜ (Görsel 3-4 Birebir) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 mb-3">
              <User size={40} />
            </div>
            <h2 className="font-extrabold text-gray-900 text-lg">{userName}</h2>
            <p className="text-xs text-rose-500 font-semibold mt-0.5">{userEmail}</p>

            {/* ADMİN HESABI İSE YÖNETİCİ PANELİ BUTONU */}
            {isAdminUser && (
              <Link
                href="/admin"
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all"
              >
                <ShieldCheck size={16} /> YÖNETİCİ PANELİNE GEÇ &rarr;
              </Link>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
            <Link
              href="/hesabim"
              className="flex items-center gap-3 px-4 py-3 text-xs font-extrabold text-emerald-600 bg-emerald-50 rounded-2xl transition-colors"
            >
              <LayoutDashboard size={18} /> HESABIM
            </Link>
            <Link
              href="/hesabim/kisisel-bilgiler"
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              <UserCheck size={18} /> KİŞİSEL BİLGİLERİM
            </Link>
            <button
              onClick={() => setActiveModal('mesajlarim')}
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

        {/* SAĞ İÇERİK ALANI */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* YÖNETİCİ HESABI UYARI BANDI */}
          {isAdminUser && (
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 rounded-3xl text-white shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={28} className="text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm">Yönetici Yetkisi Tanımlı</h3>
                  <p className="text-xs text-emerald-200">Sistem yöneticisi olarak oturum açtınız. Yönetim panelinden ürün, stok ve kampanya yönetebilirsiniz.</p>
                </div>
              </div>
              <Link href="/admin" className="bg-amber-400 text-emerald-950 px-4 py-2 rounded-xl text-xs font-extrabold flex-shrink-0 hover:bg-amber-300 transition-colors">
                Admin Paneli &rarr;
              </Link>
            </div>
          )}

          {/* SİPARİŞ TAKİP KUTUSU */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-extrabold text-sm">
              <ShoppingBag size={18} className="text-emerald-600" /> SİPARİŞ TAKİP
            </div>
            <form onSubmit={handleOrderSearch} className="flex gap-2">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Sipariş Numarası :"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-colors">
                ARA
              </button>
            </form>
            {orderSearchResult && (
              <p className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                {orderSearchResult}
              </p>
            )}
          </div>

          {/* 9 'LU DİNAMİK KART GRID (Görsel 3 Birebir) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => setActiveModal('siparislerim')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ShoppingBag size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">SİPARİŞLERİM</span>
            </button>

            <Link href="/favoriler" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Heart size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">FAVORİLERİM</span>
            </Link>

            <button onClick={() => setActiveModal('hediye_ceklerim')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Gift size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">HEDİYE ÇEKLERİM</span>
            </button>

            <button onClick={() => setActiveModal('adreslerim')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><MapPin size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">ADRESLERİM</span>
            </button>

            <button onClick={() => setActiveModal('yorumlarim')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><MessageSquare size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">YORUMLARIM</span>
            </button>

            <button onClick={() => setActiveModal('stok_alarm')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Bell size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">STOK ALARM LİSTEM</span>
            </button>

            <button onClick={() => setActiveModal('havale_bildirimi')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">HAVALE BİLDİRİMİ</span>
            </button>

            <button onClick={() => setActiveModal('fiyat_alarm')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Tag size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">FİYAT ALARM LİSTEM</span>
            </button>

            <button onClick={() => setActiveModal('uyelik_iptali')} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><UserX size={24} /></div>
              <span className="font-extrabold text-xs text-gray-800 tracking-wider">ÜYELİK İPTALİ</span>
            </button>
          </div>

        </div>

      </div>

      {/* İNTERAKTİF MODALLAR */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100">
              <X size={20} />
            </button>

            {activeModal === 'siparislerim' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" /> SİPARİŞLERİM
                </h3>
                <div className="text-center py-8 text-gray-500 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  Henüz verilmiş bir siparişiniz bulunmuyor.
                </div>
              </div>
            )}

            {activeModal === 'hediye_ceklerim' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="text-amber-500" /> HEDİYE ÇEKLERİM & İNDİRİM KODLARI
                </h3>
                <form onSubmit={handleCouponSubmit} className="flex gap-2 mb-4">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="İndirim Kupon Kodu (Örn: ONB100)" className="flex-1 px-4 py-2 border rounded-xl text-xs bg-gray-50 uppercase font-bold" />
                  <button type="submit" className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs">TANIMLA</button>
                </form>
                {couponMsg && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border">{couponMsg}</p>}
              </div>
            )}

            {activeModal === 'adreslerim' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                    <MapPin className="text-blue-600" /> ADRESLERİM ({addresses.length})
                  </h3>
                  <button onClick={() => setShowAddrForm(!showAddrForm)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <Plus size={14} /> Yeni Adres Ekle
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={handleAddAddressSubmit} className="bg-blue-50/50 p-4 rounded-xl mb-4 border border-blue-200 space-y-2 text-xs">
                    <input type="text" required placeholder="Adres Başlığı (Ev/İş)" value={newAddr.title} onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })} className="w-full p-2 border rounded-lg bg-white" />
                    <input type="text" required placeholder="Teslim Alacak Ad Soyad" value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} className="w-full p-2 border rounded-lg bg-white" />
                    <input type="text" required placeholder="Telefon" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className="w-full p-2 border rounded-lg bg-white" />
                    <div className="flex gap-2">
                      <input type="text" required placeholder="Şehir" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="w-1/2 p-2 border rounded-lg bg-white" />
                      <input type="text" required placeholder="İlçe" value={newAddr.district} onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })} className="w-1/2 p-2 border rounded-lg bg-white" />
                    </div>
                    <textarea required placeholder="Açık Adres" value={newAddr.fullAddress} onChange={(e) => setNewAddr({ ...newAddr, fullAddress: e.target.value })} className="w-full p-2 border rounded-lg bg-white" rows={2} />
                    <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg">Kaydet</button>
                  </form>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {addresses.map((a) => (
                    <div key={a.id} className="p-3 bg-gray-50 border rounded-xl text-xs flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-900">{a.title}</span> — {a.fullName} ({a.phone})
                        <p className="text-gray-500 mt-1">{a.fullAddress} · {a.district}/{a.city}</p>
                      </div>
                      <button onClick={() => removeAddress(a.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'yorumlarim' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="text-purple-600" /> YORUMLARIM</h3>
                <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl text-center">Henüz bir ürün değerlendirmesi veya yorumunuz bulunmuyor.</p>
              </div>
            )}

            {activeModal === 'stok_alarm' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><Bell className="text-amber-600" /> STOK ALARM LİSTEM</h3>
                <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl text-center">Stok geldiğinde haber verilmeyi bekleyen bir ürün bulunmuyor.</p>
              </div>
            )}

            {activeModal === 'havale_bildirimi' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="text-emerald-600" /> HAVALE / EFT BİLDİRİMİ</h3>
                <form onSubmit={(e) => { e.preventDefault(); alert('Havale bildiriminiz alındı. Teşekkürler!'); setActiveModal(null); }} className="space-y-3 text-xs">
                  <input type="text" required placeholder="Sipariş Numarası" value={bankNotice.orderId} onChange={(e) => setBankNotice({ ...bankNotice, orderId: e.target.value })} className="w-full p-2.5 border rounded-xl bg-gray-50" />
                  <input type="text" required placeholder="Ödemeyi Gönderen Ad Soyad" value={bankNotice.senderName} onChange={(e) => setBankNotice({ ...bankNotice, senderName: e.target.value })} className="w-full p-2.5 border rounded-xl bg-gray-50" />
                  <input type="text" required placeholder="Gönderilen Tutar (TL)" value={bankNotice.amount} onChange={(e) => setBankNotice({ ...bankNotice, amount: e.target.value })} className="w-full p-2.5 border rounded-xl bg-gray-50" />
                  <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl">HAVALE BİLDİRİMİNİ GÖNDER</button>
                </form>
              </div>
            )}

            {activeModal === 'fiyat_alarm' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><Tag className="text-blue-600" /> FİYAT ALARM LİSTEM</h3>
                <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl text-center">Fiyatı düştüğünde haber beklediğiniz ürün bulunmuyor.</p>
              </div>
            )}

            {activeModal === 'uyelik_iptali' && (
              <div>
                <h3 className="font-extrabold text-lg text-red-600 mb-4 flex items-center gap-2"><UserX /> ÜYELİK İPTALİ</h3>
                <p className="text-xs text-gray-600 mb-4">Hesabınızı silmek üzeresiniz. Tüm kayıtlı adresleriniz ve favorileriniz silinecektir.</p>
                <button onClick={() => { localStorage.removeItem('user_session'); signOut({ callbackUrl: '/hesabim/giris' }); }} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl text-xs">
                  ÜYELİĞİMİ İPTAL ET VE ÇIKIŞ YAP
                </button>
              </div>
            )}

            {activeModal === 'mesajlarim' && (
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="text-emerald-600" /> MÜŞTERİ MESAJLARIM</h3>
                <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl text-center">Müşteri hizmetlerimizle yapılmış aktif mesajlaşmanız bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
