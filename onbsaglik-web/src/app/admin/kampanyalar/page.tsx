/**
 * Admin Kampanya Yönetim Paneli — /admin/kampanyalar
 * Flash kampanya, combo teklif ve indirim yönetimi.
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
  combo:        { label: "🎁 Combo Teklif",   icon: <Gift size={16} />,     color: "#f59e0b" },
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
    type: "flash" as CampaignType,
    endsAt: "",
    discountedPrice: "",
    comboDescription: "",
  });

  // Oturum kontrolü
  useEffect(() => {
    if (!localStorage.getItem("admin_session")) router.replace("/admin/giris");
  }, [router]);

  // Ürünleri yükle
  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products ?? []))
      .catch(() => {});
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(form.productId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) return;
    addCampaign({
      productId: Number(form.productId),
      productName: selectedProduct?.name ?? "",
      type: form.type,
      endsAt: form.endsAt || undefined,
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      comboDescription: form.comboDescription || undefined,
      active: true,
    });
    setForm({ productId: "", type: "flash", endsAt: "", discountedPrice: "", comboDescription: "" });
    setShowForm(false);
  };

  const activeCampaigns = getActiveCampaigns();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Admin Paneli
          </Link>
          <h1 style={{ fontSize: "22px", fontWeight: 800 }}>Kampanya Yönetimi</h1>
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
          <Plus size={16} /> Yeni Kampanya Ekle
        </button>

        {/* Kampanya Formu */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "16px" }}>Yeni Kampanya</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>

              {/* Ürün seçimi */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                  Ürün Seç *
                </label>
                <select
                  required value={form.productId}
                  onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                >
                  <option value="">-- Ürün seçin --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name.substring(0, 70)}</option>
                  ))}
                </select>
              </div>

              {/* Kampanya tipi */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>Kampanya Tipi *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CampaignType }))}
                  style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                >
                  {Object.entries(CAMPAIGN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Bitiş tarihi (flash) */}
              {form.type === "flash" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>Bitiş Tarihi</label>
                  <input
                    type="datetime-local" value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                  />
                </div>
              )}

              {/* İndirimli fiyat */}
              {form.type === "discount" && (
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>
                    İndirimli Fiyat (TL) {selectedProduct && <span style={{ color: "#10b981" }}>Mevcut: {formatPrice(selectedProduct.price)}</span>}
                  </label>
                  <input
                    type="number" step="0.01" value={form.discountedPrice}
                    onChange={(e) => setForm((f) => ({ ...f, discountedPrice: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                    placeholder="299.99"
                  />
                </div>
              )}

              {/* Combo açıklaması */}
              {form.type === "combo" && (
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "5px", color: "var(--color-text-muted)" }}>Teklif Açıklaması</label>
                  <input
                    type="text" value={form.comboDescription}
                    onChange={(e) => setForm((f) => ({ ...f, comboDescription: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "14px" }}
                    placeholder="Bu ürünü alana X ürün 199 TL'ye!"
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button type="submit" className="btn-primary">Kampanya Kaydet</button>
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
                <div key={camp.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", opacity: !camp.active || isExpired ? 0.5 : 1 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${meta.color}20`, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {camp.productName}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {meta.label}
                      {camp.endsAt && ` · ${isExpired ? "⛔ Sona erdi" : `⏰ ${new Date(camp.endsAt).toLocaleString("tr-TR")}`}`}
                      {camp.comboDescription && ` · ${camp.comboDescription}`}
                      {camp.discountedPrice && ` · ${formatPrice(camp.discountedPrice)}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => updateCampaign(camp.id, { active: !camp.active })}
                      style={{ background: "none", border: "none", cursor: "pointer", color: camp.active ? "#10b981" : "#9ca3af" }}
                      title={camp.active ? "Pasife al" : "Aktive et"}
                    >
                      {camp.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button
                      onClick={() => removeCampaign(camp.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                      title="Sil"
                    >
                      <Trash2 size={18} />
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
