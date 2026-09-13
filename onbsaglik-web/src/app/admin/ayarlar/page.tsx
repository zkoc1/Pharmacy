"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { formatPrice } from "@/lib/products";

export default function AyarlarSayfasi() {
  const router = useRouter();

  // Settings State
  const [settings, setSettings] = useState({ freeShippingThreshold: 3000, shippingCost: 49.90 });
  const [savingSettings, setSavingSettings] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_amount: "",
    min_cart_amount: "",
    is_first_order_only: false
  });

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) router.replace("/admin/giris");

    // Fetch Settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.free_shipping_threshold) {
          setSettings({
            freeShippingThreshold: Number(data.free_shipping_threshold),
            shippingCost: Number(data.shipping_cost)
          });
        }
      })
      .catch(console.error);

    // Fetch Coupons
    fetchCoupons();
  }, [router]);

  const fetchCoupons = () => {
    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => setCoupons(data))
      .catch(console.error);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) alert("Kargo ayarları başarıyla kaydedildi!");
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponForm.code,
          discount_amount: Number(couponForm.discount_amount),
          min_cart_amount: Number(couponForm.min_cart_amount),
          is_first_order_only: couponForm.is_first_order_only,
          is_active: true
        })
      });
      if (res.ok) {
        setCouponForm({ code: "", discount_amount: "", min_cart_amount: "", is_first_order_only: false });
        setShowCouponForm(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Kupon eklenemedi.");
    }
  };

  const toggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus })
      });
      fetchCoupons();
    } catch (error) {
      alert("Durum değiştirilemedi.");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch (error) {
      alert("Silinemedi.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Admin Paneli
          </Link>
          <h1 style={{ fontSize: "22px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <SettingsIcon size={24} /> Genel Ayarlar & Kuponlar
          </h1>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 2fr" }}>
          
          {/* SOL: KARGO AYARLARI */}
          <div className="card" style={{ padding: "24px", alignSelf: "start" }}>
            <h2 style={{ fontWeight: 800, marginBottom: "20px", fontSize: "16px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
               Kargo Ayarları
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                Ücretsiz Kargo Alt Limiti (TL)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px", border: "2px solid var(--color-border)", borderRadius: "8px", fontWeight: 700 }}
              />
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Bu tutarın üzerindeki sepetlerde kargo bedava olur.</p>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                Standart Kargo Ücreti (TL)
              </label>
              <input
                type="number" step="0.01"
                value={settings.shippingCost}
                onChange={(e) => setSettings({ ...settings, shippingCost: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px", border: "2px solid var(--color-border)", borderRadius: "8px", fontWeight: 700 }}
              />
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="btn-primary"
              style={{ width: "100%", display: "flex", justifyContent: "center", gap: "6px" }}
            >
              <Save size={16} /> {savingSettings ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>

          {/* SAĞ: KUPONLAR */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "18px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                <Ticket size={20} /> İndirim Kuponları
              </h2>
              <button onClick={() => setShowCouponForm(!showCouponForm)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px", display: "flex", gap: "6px" }}>
                <Plus size={16} /> Yeni Kupon
              </button>
            </div>

            {/* Yeni Kupon Formu */}
            {showCouponForm && (
              <form onSubmit={handleAddCoupon} className="card" style={{ padding: "20px", marginBottom: "20px", border: "2px solid #10b981", background: "#f0fdf4" }}>
                <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Kupon Kodu *</label>
                    <input
                      type="text" required value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                      placeholder="Örn: YAZ100"
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", textTransform: "uppercase" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>İndirim Tutarı (TL) *</label>
                    <input
                      type="number" required value={couponForm.discount_amount}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_amount: e.target.value })}
                      placeholder="Örn: 100"
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Min. Sepet Tutarı (TL) *</label>
                    <input
                      type="number" required value={couponForm.min_cart_amount}
                      onChange={(e) => setCouponForm({ ...couponForm, min_cart_amount: e.target.value })}
                      placeholder="Örn: 500"
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                    <input
                      type="checkbox"
                      id="isFirstOrder"
                      checked={couponForm.is_first_order_only}
                      onChange={(e) => setCouponForm({ ...couponForm, is_first_order_only: e.target.checked })}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <label htmlFor="isFirstOrder" style={{ fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                      Sadece İlk Siparişte Geçerli Olsun
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button type="submit" className="btn-primary" style={{ padding: "8px 24px" }}>Kaydet</button>
                  <button type="button" onClick={() => setShowCouponForm(false)} style={{ padding: "8px 24px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px" }}>İptal</button>
                </div>
              </form>
            )}

            {/* Kupon Listesi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {coupons.length === 0 ? (
                <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  <p>Henüz kupon eklenmemiş.</p>
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: coupon.is_active ? 1 : 0.6 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 900, color: "#065f46", background: "#d1fae5", padding: "2px 8px", borderRadius: "6px" }}>
                          {coupon.code}
                        </span>
                        {coupon.is_first_order_only && (
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                            İlk Sipariş
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>
                        {formatPrice(coupon.discount_amount)} İndirim (Min. Sepet: {formatPrice(coupon.min_cart_amount)})
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: coupon.is_active ? "#10b981" : "#9ca3af" }}
                        title={coupon.is_active ? "Pasife al" : "Aktive et"}
                      >
                        {coupon.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                        title="Sil"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
