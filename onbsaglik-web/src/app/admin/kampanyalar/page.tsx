/**
 * Admin Kampanya Yönetim Paneli — /admin/kampanyalar
 * Flash kampanya, 2. ürün seçilebilir Combo teklif ve İndirim yönetimi.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCampaignStore, Campaign, CampaignType } from "@/stores/campaignStore";
import { Zap, Gift, Tag, Truck, Trash2, ToggleLeft, ToggleRight, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";

const CAMPAIGN_LABELS: Record<CampaignType, { label: string; icon: React.ReactNode; color: string }> = {
  flash:        { label: "⚡ Flash Kampanya", icon: <Zap size={16} />,      color: "#ef4444" },
  combo:        { label: "🎁 Combo Teklif (1 Alana 2. Şu Kadara)", icon: <Gift size={16} />, color: "#f59e0b" },
  discount:     { label: "🏷️ İndirim",        icon: <Tag size={16} />,      color: "#10b981" },
  free_shipping:{ label: "🚚 Ücretsiz Kargo", icon: <Truck size={16} />,    color: "#3b82f6" },
};

export default function KampanyalarSayfasi() {
  const router = useRouter();
  const { campaigns, addCampaign, removeCampaign, updateCampaign, getActiveCampaigns } = useCampaignStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    productId: "",
    type: "combo" as CampaignType,
    endsAt: "",
    discountedPrice: "",
    comboProductId: "",
    comboPrice: "",
    comboDescription: "",
    bannerTitle: "",
  });

  // Oturum kontrolü
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.replace("/admin/giris");
    }
  }, [router]);

  // Ürünleri yükle
  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products ?? []))
      .catch(() => {
        import("@/data/products.json").then((m) => setProducts(m.default as Product[]));
      });
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(form.productId));
  const selectedComboProduct = products.find((p) => p.id === Number(form.comboProductId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) return;

    addCampaign({
      productId: Number(form.productId),
      productName: selectedProduct?.name ?? "",
      type: form.type,
      endsAt: form.endsAt || undefined,
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      comboProductId: form.comboProductId ? Number(form.comboProductId) : undefined,
      comboProductName: selectedComboProduct?.name || undefined,
      comboPrice: form.comboPrice ? Number(form.comboPrice) : undefined,
      comboDescription: form.comboDescription || undefined,
      bannerTitle: form.bannerTitle || undefined,
      active: true,
    });

    setForm({
      productId: "",
      type: "combo",
      endsAt: "",
      discountedPrice: "",
      comboProductId: "",
      comboPrice: "",
      comboDescription: "",
      bannerTitle: "",
    });
    setShowForm(false);
  };

  const activeCampaigns = getActiveCampaigns();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "950px", margin: "0 auto" }}>
        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Admin Paneli
          </Link>
          <h1 style={{ fontSize: "22px", fontWeight: 800 }}>Kampanya & Combo Teklif Yönetimi</h1>
          <span style={{ background: "#10b981", color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
            {activeCampaigns.length} Aktif
          </span>
        </div>

        {/* Yeni Kampanya Butonu */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
        >
          <Plus size={16} /> Yeni Kampanya / Combo Teklif Ekle
        </button>

        {/* Kampanya Formu */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ padding: "28px", marginBottom: "24px", border: "2px solid #10b981" }}>
            <h2 style={{ fontWeight: 800, marginBottom: "20px", fontSize: "17px", color: "#065f46" }}>
              ✨ Yeni Kampanya & Combo Teklif Tanımla
            </h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>

              {/* Kampanya Tipi */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                  Kampanya Tipi *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CampaignType }))}
                  style={{ width: "100%", padding: "12px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px", fontWeight: 600 }}
                >
                  {Object.entries(CAMPAIGN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* 1. Ürün (Ana Ürün) */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                  1. Ürün (Ana Ürün) *
                </label>
                <select
                  required value={form.productId}
                  onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                >
                  <option value="">-- Ana ürünü seçin --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.brand} - {p.name.substring(0, 70)} ({formatPrice(p.price)})</option>
                  ))}
                </select>
              </div>

              {/* COMBO ÖZEL ALANLARI: 2. Ürün ve Fiyat Seçimi */}
              {form.type === "combo" && (
                <>
                  <div style={{ gridColumn: "span 2", background: "#fef3c7", padding: "16px", borderRadius: "12px", border: "1px solid #f59e0b" }}>
                    <p style={{ fontWeight: 800, fontSize: "13px", color: "#92400e", marginBottom: "12px" }}>
                      🎁 Combo Teklif Detayları (2. Ürün ve Özel Fiyat Seçimi)
                    </p>
                    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      
                      {/* 2. Ürün Seçimi */}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px", color: "#78350f" }}>
                          2. Ürün (Kampanyalı / Yanına Gelecek Ürün) *
                        </label>
                        <select
                          required
                          value={form.comboProductId}
                          onChange={(e) => setForm((f) => ({ ...f, comboProductId: e.target.value }))}
                          style={{ width: "100%", padding: "10px 14px", border: "2px solid #f59e0b", borderRadius: "var(--radius-md)", fontSize: "14px", background: "white" }}
                        >
                          <option value="">-- 2. Ürünü seçin --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.brand} - {p.name.substring(0, 70)} (Normal Fiyat: {formatPrice(p.price)})</option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Ürün Kampanyalı Fiyatı */}
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px", color: "#78350f" }}>
                          2. Ürünün Kampanyalı Fiyatı (TL) *
                        </label>
                        <input
                          type="number" step="0.01" required value={form.comboPrice}
                          onChange={(e) => setForm((f) => ({ ...f, comboPrice: e.target.value }))}
                          placeholder="Örn: 49.90"
                          style={{ width: "100%", padding: "10px 14px", border: "2px solid #f59e0b", borderRadius: "var(--radius-md)", fontSize: "14px", background: "white" }}
                        />
                        {selectedComboProduct && (
                          <span style={{ fontSize: "11px", color: "#92400e", marginTop: "2px", display: "block" }}>
                            Normal fiyat: {formatPrice(selectedComboProduct.price)}
                          </span>
                        )}
                      </div>

                      {/* Kampanya Banner Başlığı */}
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px", color: "#78350f" }}>
                          Kampanya Başlığı
                        </label>
                        <input
                          type="text" value={form.bannerTitle}
                          onChange={(e) => setForm((f) => ({ ...f, bannerTitle: e.target.value }))}
                          placeholder="Örn: Süper Fırsat İkilisi"
                          style={{ width: "100%", padding: "10px 14px", border: "2px solid #f59e0b", borderRadius: "var(--radius-md)", fontSize: "14px", background: "white" }}
                        />
                      </div>

                      {/* Teklif Açıklaması */}
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px", color: "#78350f" }}>
                          Müşteriye Gösterilecek Teklif Metni
                        </label>
                        <input
                          type="text" value={form.comboDescription}
                          onChange={(e) => setForm((f) => ({ ...f, comboDescription: e.target.value }))}
                          placeholder="Örn: Bu ürünü alana 2. Ürün SADECE 49.90 TL!"
                          style={{ width: "100%", padding: "10px 14px", border: "2px solid #f59e0b", borderRadius: "var(--radius-md)", fontSize: "14px", background: "white" }}
                        />
                      </div>

                    </div>
                  </div>
                </>
              )}

              {/* Kampanyalı Özel Fiyat — Tüm Kampanya Tipleri İçin Zorunlu */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                  Kampanyalı / İndirimli Fiyat (TL) * {selectedProduct && <span style={{ color: "#10b981" }}>(Normal: {formatPrice(selectedProduct.price)})</span>}
                </label>
                <input
                  type="number" step="0.01" required value={form.discountedPrice}
                  onChange={(e) => setForm((f) => ({ ...f, discountedPrice: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid #10b981", borderRadius: "var(--radius-md)", fontSize: "14px", fontWeight: 700 }}
                  placeholder="Örn: 299.90"
                />
              </div>

              {/* Bitiş tarihi (Flash Kampanya için) */}
              {form.type === "flash" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>Flash Bitiş Tarihi *</label>
                  <input
                    type="datetime-local" required value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #ef4444", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button type="submit" className="btn-primary">Kampanyayı Oluştur ve Yayınla</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "white", cursor: "pointer", fontSize: "14px" }}>İptal</button>
            </div>
          </form>
        )}

        {/* Kampanya Listesi */}
        {campaigns.length === 0 ? (
          <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>
            <Zap size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>Henüz kampanya eklenmemiş.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {campaigns.map((camp) => {
              const meta = CAMPAIGN_LABELS[camp.type];
              const isExpired = camp.endsAt && new Date(camp.endsAt) < new Date();
              return (
                <div key={camp.id} className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", opacity: !camp.active || isExpired ? 0.5 : 1 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${meta.color}20`, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: meta.color, background: `${meta.color}15`, padding: "2px 8px", borderRadius: "6px" }}>
                        {meta.label}
                      </span>
                      {camp.bannerTitle && (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>{camp.bannerTitle}</span>
                      )}
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      1. Ürün: {camp.productName}
                    </p>
                    {camp.comboProductName && (
                      <p style={{ fontSize: "13px", color: "#d97706", fontWeight: 600, marginTop: "2px" }}>
                        2. Ürün: {camp.comboProductName} → {camp.comboPrice ? formatPrice(camp.comboPrice) : "Kampanyalı"}
                      </p>
                    )}
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      {camp.endsAt && ` ⏰ Bitiş: ${new Date(camp.endsAt).toLocaleString("tr-TR")}`}
                      {camp.comboDescription && ` · Metin: "${camp.comboDescription}"`}
                      {camp.discountedPrice && ` · İndirimli: ${formatPrice(camp.discountedPrice)}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => updateCampaign(camp.id, { active: !camp.active })}
                      style={{ background: "none", border: "none", cursor: "pointer", color: camp.active ? "#10b981" : "#9ca3af" }}
                      title={camp.active ? "Pasife al" : "Aktive et"}
                    >
                      {camp.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                    <button
                      onClick={() => removeCampaign(camp.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                      title="Sil"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
