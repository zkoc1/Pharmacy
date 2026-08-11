/**
 * Hesabım sayfası — /hesabim rotası.
 * Müşteri girişi, sipariş takibi ve admin girişi yönlendirmesi.
 */

"use client";

import { useState } from "react";
import { User, Shield, Package, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function HesabimSayfasi() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Müşteri girişi yakında aktif olacaktır. Admin girişi için Admin Paneli bağlantısını kullanabilirsiniz.");
  };

  return (
    <div className="container-custom py-12" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-10">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            background: "var(--gradient-primary)",
            color: "white",
            borderRadius: "50%",
            marginBottom: "16px",
          }}
        >
          <User size={32} />
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
          Hesabım
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          OnbSağlık üye girişi ve sipariş takibi
        </p>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Müşteri Giriş Formu */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
            Müşteri Girişi
          </h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                E-posta Adresi
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Şifre
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "8px" }}>
              Giriş Yap
            </button>
          </form>
        </div>

        {/* Hızlı İşlemler & Admin */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Admin Paneli Geçiş Kartı */}
          <Link
            href="/admin/giris"
            className="card"
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textDecoration: "none",
              color: "inherit",
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "2px solid var(--color-primary-light)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "2px" }}>
                Admin Yönetim Paneli
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                Stok ve fiyat güncellemesi için giriş yapın →
              </p>
            </div>
          </Link>

          {/* Sipariş Takibi */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <Package size={22} style={{ color: "var(--color-primary)" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Sipariş Takibi</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: "1.6" }}>
              Siparişinizin durumunu sorgulamak için e-posta ile gönderilen kargo takip numarasını kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
