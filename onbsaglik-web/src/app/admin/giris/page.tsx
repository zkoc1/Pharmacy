/**
 * Admin giriş sayfası — /admin/giris rotası.
 * Basit şifre koruması. İleride NextAuth ile gerçek auth eklenecek.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminGiris() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basit demo kimlik doğrulama (gerçek uygulamada API çağrısı yapılır)
    await new Promise((r) => setTimeout(r, 800));

    if (email === "admin@onbsaglik.com" && password === "onbAdmin2024!") {
      // Oturum bilgisini localStorage'a kaydet
      localStorage.setItem("admin_session", JSON.stringify({ email, role: "super_admin" }));
      router.push("/admin");
    } else {
      setError("E-posta veya şifre hatalı.");
    }

    setLoading(false);
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
            onbsaglik.com yönetim sistemi
          </p>
        </div>

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
              placeholder="admin@onbsaglik.com"
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
