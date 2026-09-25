/**
 * Admin giriş sayfası — /admin/giris rotası.
 * Basit şifre koruması. İleride NextAuth ile gerçek auth eklenecek.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff, Clock } from "lucide-react";
import { setAdminSession, restoreAdminSessionIfNeeded } from "@/lib/authUtils";

function AdminGirisForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";

  // Zaten geçerli oturum varsa doğrudan Admin Paneline aktar
  useEffect(() => {
    restoreAdminSessionIfNeeded().then((session) => {
      if (session) {
        window.location.href = "/admin";
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Oturum süresiyle (24 saat) güvenli kayıt
        setAdminSession(data.user);
        // Tam sayfa yenileme ile çerezlerin middleware'e kesin iletilmesini sağla
        window.location.href = "/admin";
      } else {
        setError(data.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.");
      }
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gradient-hero)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          borderRadius: "var(--radius-xl)",
          padding: "40px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              background: "var(--gradient-primary)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "16px",
            }}
          >
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
            Admin Paneli
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            onbsaglik.com.tr yönetim sistemi
          </p>
        </div>

        {/* Oturum Süresi Doldu Uyarısı */}
        {isExpired && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 14px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-md)",
              color: "#92400e",
              fontSize: "13px",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <Clock size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <span style={{ fontWeight: 600, display: "block" }}>Oturum Süresi Doldu</span>
              Güvenliğiniz için 24 saatlik oturum süresi dolmuştur. Lütfen tekrar giriş yapın.
            </div>
          </div>
        )}

        {/* Giriş formu */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* E-posta */}
          <div>
            <label
              htmlFor="admin-email"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}
            >
              E-posta
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@onbsaglik.com.tr"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "15px",
                outline: "none",
                transition: "var(--transition)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* Şifre */}
          <div>
            <label
              htmlFor="admin-password"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}
            >
              Şifre
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "15px",
                  outline: "none",
                  transition: "var(--transition)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-sm)",
                color: "#dc2626",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* Giriş butonu */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", marginTop: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminGiris() {
  return (
    <Suspense fallback={null}>
      <AdminGirisForm />
    </Suspense>
  );
}
