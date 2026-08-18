/**
 * Ödeme sayfası — /odeme
 * PayTR iframe ile güvenli ödeme + Kayıtlı Adres Otomatik Doldurma + Demo Sandbox Desteği.
 */
"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAddressStore } from "@/stores/addressStore";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/products";
import { ShoppingCart, CreditCard, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OdemeSayfasi() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { getDefaultAddress, addresses } = useAddressStore();
  const { data: session } = useSession();

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
  const [paytrToken, setPaytrToken] = useState("");

  // Kayıtlı adresi veya kullanıcı bilgilerini otomatik doldur
  useEffect(() => {
    const defaultAddr = getDefaultAddress();
    if (defaultAddr) {
      const parts = (defaultAddr.fullName || "").split(" ");
      const name = parts[0] || "";
      const surname = parts.slice(1).join(" ") || "";

      setBuyer({
        name,
        surname,
        email: session?.user?.email || buyer.email || "musteri@onbsaglik.com",
        phone: defaultAddr.phone || "",
        city: `${defaultAddr.district} / ${defaultAddr.city}`,
        address: defaultAddr.fullAddress || "",
      });
    } else if (session?.user) {
      setBuyer((p) => ({
        ...p,
        email: session.user?.email || p.email,
        name: session.user?.name ? session.user.name.split(" ")[0] : p.name,
      }));
    }
  }, [session, addresses, getDefaultAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBuyer((p) => ({ ...p, [e.target.name]: e.target.value }));

  // PayTR iframe JS'ini yükle
  useEffect(() => {
    if (!paytrToken) return;
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.onload = () => {
      // @ts-expect-error PayTR global
      if (window.iFrameResize) window.iFrameResize({ log: false }, "#paytriframe");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [paytrToken]);

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
      const data = (await res.json()) as { success: boolean; token?: string; error?: string; demo?: boolean };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Ödeme başlatılamadı.");
        return;
      }

      if (data.token) {
        setPaytrToken(data.token);
      } else if (data.demo) {
        // PayTR keyleri henüz girilmediyse Demo Simülasyon
        clearCart();
        window.location.href = `/odeme/basarili?orderId=ONB-${Date.now()}`;
      }
    } catch {
      setError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !paytrToken) {
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

  // PayTR iframe göster
  if (paytrToken) {
    return (
      <div className="container-custom py-8" style={{ maxWidth: "700px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>🔒 Güvenli Ödeme — PayTR</h1>
        <iframe
          id="paytriframe"
          src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
          style={{ width: "100%", border: "none", minHeight: "480px" }}
          allowFullScreen
        />
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "12px" }}>
          🔒 256-bit SSL şifreleme · PayTR güvencesiyle
        </p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "32px" }}>Ödeme ve Teslimat</h1>
      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Müşteri formu */}
        <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Kayıtlı Adres Seçimi Uyarısı */}
          {addresses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-blue-900">Kayıtlı Adresiniz Otomatik Yüklendi</p>
                  <p className="text-[11px] text-blue-700">{getDefaultAddress()?.title}: {getDefaultAddress()?.fullAddress}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <CheckCircle2 size={12} /> Seçildi
              </span>
            </div>
          )}

          <div className="card" style={{ padding: "28px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "17px" }}>Teslimat Bilgileri</h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { name: "name", label: "Ad", placeholder: "Adınız" },
                { name: "surname", label: "Soyad", placeholder: "Soyadınız" },
                { name: "email", label: "E-posta", placeholder: "eposta@gmail.com" },
                { name: "phone", label: "Telefon", placeholder: "05XXXXXXXXX" },
                { name: "city", label: "Şehir / İlçe", placeholder: "İstanbul / Kadıköy" },
              ].map((f) => (
                <div key={f.name}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "5px",
                      color: "var(--color-text-muted)",
                    }}
                  >
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
                      width: "100%",
                      padding: "10px 14px",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "5px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Açık Adres *
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Mahalle, sokak, bina no, daire..."
                  value={buyer.address}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-md)",
                color: "#dc2626",
                fontSize: "13px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              fontSize: "16px",
              padding: "14px 24px",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Ödeme hazırlanıyor...
              </>
            ) : (
              <>
                <CreditCard size={18} /> {formatPrice(grandTotal)} — PayTR ile Güvenli Öde
              </>
            )}
          </button>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center" }}>
            🔒 SSL şifrelemeli ödeme · PayTR güvencesiyle
          </p>
        </form>

        {/* Sipariş özeti */}
        <div className="card" style={{ padding: "24px", alignSelf: "start", position: "sticky", top: "100px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "15px" }}>Sipariş Özeti</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {items.map(({ product, quantity }) => (
              <div key={product.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span
                  style={{
                    flex: 1,
                    color: "var(--color-text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginRight: "8px",
                  }}
                >
                  {product.name} x{quantity}
                </span>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
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
