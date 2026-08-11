/**
 * Favoriler sayfası — /favoriler rotası.
 * Kullanıcının favoriye eklediği ürünleri listeler.
 */

"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function FavorilerSayfasi() {
  return (
    <div className="container-custom py-16 text-center">
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "64px",
          height: "64px",
          background: "#fef2f2",
          color: "#ef4444",
          borderRadius: "50%",
          marginBottom: "16px",
        }}
      >
        <Heart size={32} />
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
        Favoriler Listeniz Boş
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
        Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
      </p>
      <Link href="/" className="btn-primary" style={{ display: "inline-flex" }}>
        Ürünleri Keşfet
      </Link>
    </div>
  );
}
