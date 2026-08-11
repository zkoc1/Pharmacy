/**
 * Ödeme başarılı sayfası — /odeme/basarili
 */
"use client";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";

export default function OdemeBasarili() {
  const clearCart = useCartStore((s) => s.clearCart);
  // Ödeme onaylandıktan sonra sepeti temizle
  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <div className="container-custom py-20 text-center">
      <div style={{ fontSize: "72px", marginBottom: "24px" }}>✅</div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px", color: "var(--color-primary)" }}>
        Siparişiniz Alındı!
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "32px", maxWidth: "440px", margin: "0 auto 32px" }}>
        Ödemeniz başarıyla tamamlandı. Kargo bilgileri e-posta adresinize gönderilecektir.
      </p>
      <Link href="/" className="btn-primary" style={{ display: "inline-flex" }}>
        Alışverişe Devam Et
      </Link>
    </div>
  );
}
