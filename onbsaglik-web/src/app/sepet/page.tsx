/**
 * Sepet sayfası — /sepet rotası.
 * Sepet içeriğini gösterir ve ödemeye yönlendirir.
 */

"use client";

import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/products";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SepetSayfasi() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const total = getTotalPrice();
  const shippingFree = total >= 500;
  const shippingCost = shippingFree ? 0 : 39.9;

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingCart size={64} style={{ margin: "0 auto 16px", color: "var(--color-text-light)" }} />
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Sepetiniz Boş
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          Alışverişe başlamak için ürünleri keşfedin.
        </p>
        <Link href="/" className="btn-primary">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-8">Sepetim ({items.length} ürün)</h1>

      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Sepet ürünleri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card" style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Görsel */}
              <div style={{ flexShrink: 0, width: "80px", height: "80px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} width={80} height={80} style={{ objectFit: "contain" }} unoptimized />
                ) : (
                  <ShoppingCart size={32} style={{ color: "var(--color-text-light)" }} />
                )}
              </div>

              {/* Bilgiler */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: 600, marginBottom: "2px" }}>{product.brand}</p>
                <p className="line-clamp-2" style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>{product.name}</p>
                <p style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "16px" }}>{formatPrice(product.price)}</p>
              </div>

              {/* Miktar */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <button onClick={() => updateQuantity(product.id, quantity - 1)} style={{ padding: "6px 10px", background: "none", border: "none", cursor: "pointer" }}>
                  <Minus size={14} />
                </button>
                <span style={{ padding: "6px 4px", fontWeight: 700, minWidth: "24px", textAlign: "center" }}>{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1)} style={{ padding: "6px 10px", background: "none", border: "none", cursor: "pointer" }}>
                  <Plus size={14} />
                </button>
              </div>

              {/* Toplam fiyat */}
              <div style={{ textAlign: "right", minWidth: "80px" }}>
                <p style={{ fontWeight: 800, fontSize: "15px" }}>{formatPrice(product.price * quantity)}</p>
              </div>

              {/* Sil */}
              <button onClick={() => removeItem(product.id)} style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button onClick={clearCart} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>
            Sepeti Temizle
          </button>
        </div>

        {/* Sipariş özeti */}
        <div>
          <div className="card" style={{ padding: "24px", position: "sticky", top: "100px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "16px" }}>Sipariş Özeti</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Ürünler Toplamı</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Kargo</span>
                <span style={{ fontWeight: 600, color: shippingFree ? "var(--color-primary)" : "inherit" }}>
                  {shippingFree ? "Ücretsiz" : formatPrice(shippingCost)}
                </span>
              </div>
              {!shippingFree && (
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", background: "#fef3c7", padding: "8px", borderRadius: "var(--radius-sm)" }}>
                  {formatPrice(500 - total)} daha ekleyin, kargo ücretsiz!
                </p>
              )}
              <div style={{ paddingTop: "12px", borderTop: "2px solid var(--color-border)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>Toplam</span>
                <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--color-primary)" }}>
                  {formatPrice(total + shippingCost)}
                </span>
              </div>
            </div>

            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Ödemeye Geç <ArrowRight size={16} />
            </button>

            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center", marginTop: "12px" }}>
              🔒 SSL güvenli ödeme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
