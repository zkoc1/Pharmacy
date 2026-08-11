/**
 * Checkout sayfası — /odeme
 * Sepet özetini gösterir, müşteri bilgilerini alır ve iyzico formunu açar.
 */

"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/products";
import { ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

export default function OdemeSayfasi() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const shipping = total >= 500 ? 0 : 39.9;
  const grandTotal = total + shipping;

  const [buyer, setBuyer] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    city: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // iyzico'dan dönen ödeme formu HTML'i
  const [checkoutHtml, setCheckoutHtml] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBuyer((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Ödeme formunu başlat
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            category: product.category,
          })),
          buyer,
          total: grandTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        return;
      }

      // iyzico formunu sayfaya göm ve çalıştır
      setCheckoutHtml(data.checkoutFormContent);
    } catch {
      setError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  // Sepet boşsa yönlendir
  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingCart size={56} style={{ margin: "0 auto 16px", color: "var(--color-text-light)" }} />
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Sepetiniz boş</h1>
        <Link href="/" className="btn-primary" style={{ display: "inline-flex", marginTop: "16px" }}>
          Alışverişe Devam Et
        </Link>
      </div>
    );
  }

  // iyzico formu hazırsa göster
  if (checkoutHtml) {
    return (
      <div className="container-custom py-8" style={{ maxWidth: "600px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>
          🔒 Güvenli Ödeme
        </h1>
        {/* iyzico formu dinamik olarak eklenir */}
        <div dangerouslySetInnerHTML={{ __html: checkoutHtml }} />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "32px" }}>Ödeme</h1>

      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Müşteri bilgi formu */}
        <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "28px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "17px" }}>
              Teslimat Bilgileri
            </h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { name: "name", label: "Ad", placeholder: "Adınız" },
                { name: "surname", label: "Soyad", placeholder: "Soyadınız" },
                { name: "email", label: "E-posta", placeholder: "eposta@gmail.com" },
                { name: "phone", label: "Telefon", placeholder: "0532 XXX XX XX" },
                { name: "city", label: "Şehir", placeholder: "İstanbul" },
              ].map((f) => (
                <div key={f.name} style={{ gridColumn: f.name === "email" || f.name === "phone" ? "span 1" : "span 1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "5px", color: "var(--color-text-muted)" }}>
                    {f.label} *
                  </label>
                  <input
                    name={f.name}
                    type={f.name === "email" ? "email" : "text"}
                    required
                    placeholder={f.placeholder}
                    value={(buyer as Record<string, string>)[f.name]}
                    onChange={handleChange}
                    style={{
                      width: "100%", padding: "10px 14px",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-md)", fontSize: "14px", outline: "none",
                    }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "5px", color: "var(--color-text-muted)" }}>
                  Adres *
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Mahalle, sokak, bina no, daire..."
                  value={buyer.address}
                  onChange={handleChange}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)", fontSize: "14px",
                    outline: "none", resize: "vertical", fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", color: "#dc2626", fontSize: "13px" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ fontSize: "16px", padding: "14px 24px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Ödeme hazırlanıyor...</>
            ) : (
              <><CreditCard size={18} /> {formatPrice(grandTotal)} — Güvenli Ödeme</>
            )}
          </button>

          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center" }}>
            🔒 SSL şifrelemeli ödeme · iyzico güvencesiyle
          </p>
        </form>

        {/* Sipariş özeti */}
        <div className="card" style={{ padding: "24px", alignSelf: "start", position: "sticky", top: "100px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "15px" }}>Sipariş Özeti</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {items.map(({ product, quantity }) => (
              <div key={product.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span className="line-clamp-1" style={{ flex: 1, color: "var(--color-text-muted)" }}>
                  {product.name} x{quantity}
                </span>
                <span style={{ fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Kargo</span>
              <span style={{ color: shipping === 0 ? "var(--color-primary)" : "inherit", fontWeight: 600 }}>
                {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "17px" }}>
              <span>Toplam</span>
              <span style={{ color: "var(--color-primary)" }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
