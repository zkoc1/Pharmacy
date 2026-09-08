/**
 * Admin paneli ana sayfası — /admin rotası.
 * Stok, fiyat güncelleme, Admin Hesap Yönetimi ve Kupon/Hediye Çeki Merkezi.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, TrendingUp, ShoppingBag, Eye, EyeOff, Search, Shield, UserPlus, Gift, ArrowRight, X } from "lucide-react";
import { useAdminProductStore } from "@/stores/adminProductStore";
import type { Product } from "@/types";

export default function AdminPaneli() {

  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const { products, setInitialProducts } = useAdminProductStore();

  // Admin Ekleme & Kupon Oluşturma Modal State'leri
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [adminNotice, setAdminNotice] = useState("");

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponAmount, setNewCouponAmount] = useState("");
  const [couponNotice, setCouponNotice] = useState("");

  // Oturum ve Rol kontrolü
  useEffect(() => {
    const rawSession = localStorage.getItem("admin_session");
    if (!rawSession) {
      router.replace("/admin/giris");
      return;
    }
    try {
      const parsed = JSON.parse(rawSession);
      if (parsed.role === "super_admin" || parsed.role === "admin") {
        setIsAuthorized(true);
      } else {
        localStorage.removeItem("admin_session");
        router.replace("/admin/giris");
        return;
      }
    } catch {
      router.replace("/admin/giris");
      return;
    }

    import("@/data/products.json").then((m) => {
      setInitialProducts(m.default as Product[]);
    });
  }, [router, setInitialProducts]);

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPass) return;
    const adminsRaw = localStorage.getItem("onbsaglik_admin_accounts");
    let admins: { email: string; role: string }[] = [];
    if (adminsRaw) {
      try { admins = JSON.parse(adminsRaw); } catch {}
    }
    admins.push({ email: newAdminEmail.trim().toLowerCase(), role: "admin" });
    localStorage.setItem("onbsaglik_admin_accounts", JSON.stringify(admins));
    setAdminNotice(`✅ Yeni admin hesabı (${newAdminEmail}) başarıyla oluşturuldu!`);
    setNewAdminEmail("");
    setNewAdminPass("");
    setTimeout(() => { setAdminNotice(""); setShowAdminModal(false); }, 2000);
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponAmount) return;
    const couponsRaw = localStorage.getItem("onbsaglik_coupons");
    let coupons: { code: string; amount: number }[] = [];
    if (couponsRaw) {
      try { coupons = JSON.parse(couponsRaw); } catch {}
    }
    coupons.push({ code: newCouponCode.trim().toUpperCase(), amount: parseFloat(newCouponAmount) });
    localStorage.setItem("onbsaglik_coupons", JSON.stringify(coupons));
    setCouponNotice(`🎉 Kupon (${newCouponCode.toUpperCase()}) active edildi!`);
    setNewCouponCode("");
    setNewCouponAmount("");
    setTimeout(() => { setCouponNotice(""); setShowCouponModal(false); }, 2000);
  };

  const activeCount = products.filter((p) => p.status === "active").length;
  const draftCount = products.filter((p) => p.status === "draft").length;

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", color: "white", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <Shield size={36} />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Erişim Kilitli (Yetkisiz Erişim)</h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "420px", marginBottom: "24px" }}>
          Yönetici paneline erişebilmek için geçerli bir Admin/SuperAdmin hesabıyla oturum açmalısınız.
        </p>
        <a href="/admin/giris" className="btn-primary" style={{ padding: "12px 24px", textDecoration: "none" }}>
          Yönetici Girişi Yap
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
      {/* Admin üst çubuğu */}
      <header style={{ background: "var(--gradient-hero)", color: "white", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "white", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px" }}>
            🌿
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>OnbSağlık Yönetim Paneli</h1>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: 0 }}>Stok, Fiyat, Admin & Kupon Yönetimi</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setShowAdminModal(true)} className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all">
            <UserPlus size={14} /> Yeni Admin Ekle
          </button>
          <button onClick={() => setShowCouponModal(true)} className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all">
            <Gift size={14} /> Hediye Çeki Tanımla
          </button>
          <a href="/admin/urunler" style={{ background: "#0284c7", color: "white", padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
            🏷️ Ürünler ve Stok
          </a>
          <a href="/admin/siparisler" style={{ background: "#8b5cf6", color: "white", padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
            📦 Sipariş Yönetimi
          </a>
          <a href="/admin/kampanyalar" style={{ background: "#f59e0b", color: "#78350f", padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
            ⚡ Kampanya Yönetimi
          </a>
          <a href="/admin/yorumlar" style={{ background: "#10b981", color: "white", padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
            ⭐ Yorum Yönetimi
          </a>
          <a href="/" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            Siteye Dön &rarr;
          </a>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Package size={24} /></div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase">Toplam Ürün</span>
                <h3 className="text-2xl font-extrabold text-gray-900">{products.length}</h3>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Eye size={24} /></div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase">Aktif Ürünler</span>
                <h3 className="text-2xl font-extrabold text-emerald-600">{activeCount}</h3>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><EyeOff size={24} /></div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase">Taslaklar</span>
                <h3 className="text-2xl font-extrabold text-amber-600">{draftCount}</h3>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={24} /></div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase">Trendyol Senkron</span>
                <h3 className="text-sm font-extrabold text-blue-600">Aktif (Otomatik)</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Yönlendirmeler */}
        <div className="card p-8 mt-8 flex flex-col items-center justify-center text-center bg-sky-50 border-sky-100">
          <div className="p-4 bg-white rounded-full mb-4 shadow-sm text-sky-600"><Package size={32}/></div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Gelişmiş Ürün ve Stok Yönetimi (PIM)</h2>
          <p className="text-gray-500 font-medium mb-6 max-w-md">
            Yeni ürün eklemek, mevcut ürünlerin stok veya fiyatlarını güncellemek için yeni gelişmiş modülü kullanın.
          </p>
          <a href="/admin/urunler" className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all">
            Ürün Yönetimine Git <ArrowRight size={18}/>
          </a>
        </div>

        {/* YENİ ADMİN HESABI EKLEME MODALİ */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
              <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
              <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2 border-b pb-3">
                <UserPlus className="text-emerald-600" /> Yeni Admin Hesabı Tanımla
              </h3>

              <form onSubmit={handleAddAdminSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Admin E-posta Adresi *</label>
                  <input type="email" required value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="yeniadmin@onbsaglik.com.tr" className="w-full p-2.5 border rounded-xl text-xs bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Şifre *</label>
                  <input type="password" required value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} placeholder="••••••••" className="w-full p-2.5 border rounded-xl text-xs bg-gray-50" />
                </div>

                {adminNotice && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">{adminNotice}</p>}

                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs">ADMİN HESABI OLUŞTUR</button>
              </form>
            </div>
          </div>
        )}

        {/* KUPON / HEDİYE ÇEKİ OLUŞTURMA MODALİ */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
              <button onClick={() => setShowCouponModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
              <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2 border-b pb-3">
                <Gift className="text-amber-500" /> Yeni Hediye Çeki / Kupon Tanımla
              </h3>

              <form onSubmit={handleAddCouponSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kupon Kodu *</label>
                  <input type="text" required value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} placeholder="Örn: ONB100 veya YAZ50" className="w-full p-2.5 border rounded-xl text-xs bg-gray-50 uppercase font-extrabold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">İndirim Tutarı (TL) *</label>
                  <input type="number" required value={newCouponAmount} onChange={(e) => setNewCouponAmount(e.target.value)} placeholder="100" className="w-full p-2.5 border rounded-xl text-xs bg-gray-50 font-extrabold" />
                </div>

                {couponNotice && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">{couponNotice}</p>}

                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl text-xs">KUPONU OLUŞTUR VE AKTİFLEŞTİR</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
