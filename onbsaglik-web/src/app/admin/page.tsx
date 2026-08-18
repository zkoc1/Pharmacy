/**
 * Admin paneli ana sayfası — /admin rotası.
 * Stok, fiyat güncelleme ve ürün yönetimi merkezi.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, TrendingUp, ShoppingBag, Edit2, Eye, EyeOff, Search, RefreshCw, Shield } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";

export default function AdminPaneli() {

  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "draft">("all");

  const [isAuthorized, setIsAuthorized] = useState(false);

  // Oturum ve Rol kontrolü — yetkisiz kullanıcıları tamamen engelle
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

    // Ürünleri JSON dosyasından yükle
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => {
        // API yoksa statik veriyi simüle et
        import("@/data/products.json").then((m) => setProducts(m.default as Product[]));
      });
  }, [router]);

  // Arama ve durum filtresi
  const filtered = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Ürün kaydetme simülasyonu (gerçek uygulamada API çağrısı)
  const handleSave = () => {
    if (!editingProduct) return;
    const price = parseFloat(editPrice);
    const stock = parseInt(editStock);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, price: isNaN(price) ? p.price : price, stock: isNaN(stock) ? p.stock : stock }
          : p
      )
    );

    setSaveMsg("Kaydedildi!");
    setTimeout(() => {
      setSaveMsg("");
      setEditingProduct(null);
    }, 1500);
  };

  // Durum değiştirme simülasyonu
  const toggleStatus = (product: Product) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, status: p.status === "active" ? "draft" : "active" }
          : p
      )
    );
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
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
      }}
    >
      {/* Admin üst çubuğu */}
      <header
        style={{
          background: "var(--gradient-hero)",
          color: "white",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Package size={24} />
          <span style={{ fontWeight: 700, fontSize: "18px" }}>OnbSağlık Admin</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
            Siteye Dön ↗
          </a>
          <button
            onClick={() => {
              localStorage.removeItem("admin_session");
              router.push("/admin/giris");
            }}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "var(--radius-sm)",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Çıkış
          </button>
        </div>
      </header>

      <div style={{ padding: "32px" }}>
        {/* İstatistik kartları */}
        <div
          className="grid gap-6 mb-8"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          {[
            { icon: <Package size={20} />, label: "Toplam Ürün", value: products.length, color: "#10b981" },
            { icon: <TrendingUp size={20} />, label: "Aktif Ürün", value: activeCount, color: "#3b82f6" },
            { icon: <EyeOff size={20} />, label: "Taslak", value: draftCount, color: "#f59e0b" },
            { icon: <ShoppingBag size={20} />, label: "Marka", value: new Set(products.map((p) => p.brand)).size, color: "#8b5cf6" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                  color: stat.color,
                }}
              >
                {stat.icon}
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)" }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
          {/* Kampanya Yönetim Butonu */}
          <a href="/admin/kampanyalar" className="card" style={{ padding: "24px", textDecoration: "none", color: "inherit", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "2px solid #f59e0b", cursor: "pointer", display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", color: "#f59e0b" }}>
              <span style={{ fontSize: "20px" }}>⚡</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>Kampanyalar</span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#92400e" }}>Yönet →</div>
          </a>
          {/* Trendyol Senkron Butonu */}
          <button
            onClick={async () => {
              const r = await fetch("/api/admin/sync-trendyol");
              const d = await r.json();
              alert(d.message ?? `${d.synced ?? 0} ürün senkronize edildi.`);
            }}
            className="card"
            style={{ padding: "24px", background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", border: "2px solid #3b82f6", cursor: "pointer", display: "block", textAlign: "left", width: "100%" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", color: "#3b82f6" }}>
              <RefreshCw size={20} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e40af" }}>Trendyol Sync</span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e40af" }}>Stok Senkronize Et</div>
          </button>
        </div>

        {/* Ürün yönetim tablosu */}
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {/* Tablo başlığı */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              borderBottom: "1px solid var(--color-border)",
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ fontWeight: 700, fontSize: "16px", flex: 1 }}>Ürün Yönetimi</h2>

            {/* Arama */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Ürün veya marka ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px 8px 36px",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  width: "220px",
                  outline: "none",
                }}
              />
            </div>

            {/* Durum filtresi */}
            {(["all", "active", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: "6px 14px",
                  border: "2px solid",
                  borderColor: filterStatus === s ? "var(--color-primary)" : "var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: filterStatus === s ? "var(--color-primary)" : "white",
                  color: filterStatus === s ? "white" : "var(--color-text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "var(--transition)",
                }}
              >
                {s === "all" ? "Tümü" : s === "active" ? "Aktif" : "Taslak"}
              </button>
            ))}
          </div>

          {/* Tablo */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["ID", "Ürün Adı", "Marka", "Fiyat", "Stok", "Durum", "İşlemler"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((product, i) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: i % 2 === 0 ? "white" : "var(--color-bg)",
                    }}
                  >
                    <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>
                      #{product.id}
                    </td>
                    <td style={{ padding: "12px 16px", maxWidth: "260px" }}>
                      <div className="line-clamp-2" style={{ fontWeight: 500 }}>
                        {product.name}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--color-primary)", fontWeight: 600 }}>
                      {product.brand}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {formatPrice(product.price)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: product.stock > 0 ? "var(--color-primary)" : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {product.stock}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className="badge"
                        style={{
                          background: product.status === "active" ? "#dcfce7" : "#fef3c7",
                          color: product.status === "active" ? "#166534" : "#92400e",
                        }}
                      >
                        {product.status === "active" ? "Aktif" : "Taslak"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* Düzenleme butonu */}
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditPrice(String(product.price));
                            setEditStock(String(product.stock));
                          }}
                          style={{
                            padding: "6px 10px",
                            background: "var(--color-primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                          }}
                        >
                          <Edit2 size={12} /> Düzenle
                        </button>

                        {/* Durum toggle */}
                        <button
                          onClick={() => toggleStatus(product)}
                          style={{
                            padding: "6px 10px",
                            background: product.status === "active" ? "#fef3c7" : "#dcfce7",
                            color: product.status === "active" ? "#92400e" : "#166534",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {product.status === "active" ? (
                            <><EyeOff size={12} /> Gizle</>
                          ) : (
                            <><Eye size={12} /> Yayınla</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>
                Ürün bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Düzenleme modalı */}
      {editingProduct && (
        <div
          onClick={() => setEditingProduct(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ padding: "32px", width: "420px" }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>Ürün Düzenle</h3>
            <p className="line-clamp-2" style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "24px" }}>
              {editingProduct.name}
            </p>

            {/* Fiyat alanı */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Satış Fiyatı (TL)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* Stok alanı */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Stok Adedi
              </label>
              <input
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* Butonlar */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {saveMsg || "Kaydet"}
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="btn-outline"
                style={{ flex: 1 }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
