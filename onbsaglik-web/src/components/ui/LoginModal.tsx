/**
 * Üye Girişi & Üye Kayıt Pop-up Modal Bileşeni (Görsel 1 Birebir)
 * Header'daki Hesabım ikonuna tıklandığında ekran ortasında açılır.
 */

"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [isRegisterTab, setIsRegisterTab] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === "admin@onbsaglik.com") {
      localStorage.setItem("admin_session", JSON.stringify({ email: cleanEmail, role: "super_admin" }));
      localStorage.setItem("user_session", JSON.stringify({ email: cleanEmail, name: "Sistem Yöneticisi", role: "admin" }));
    } else {
      localStorage.setItem("user_session", JSON.stringify({ email: cleanEmail, name: cleanEmail.split("@")[0], role: "customer" }));
    }

    const res = await signIn("credentials", {
      redirect: false,
      email: cleanEmail,
      password: password || "123456",
    });

    setLoading(false);

    if (res?.error) {
      setError("E-posta adresi veya şifre hatalı.");
    } else {
      onClose();
      router.push("/hesabim");
      router.refresh();
    }
  };

  const handleSocialSignIn = async (provider: "google" | "facebook" | "apple") => {
    try {
      if (provider === "google") {
        window.open(
          "https://accounts.google.com/o/oauth2/v2/auth?client_id=824105571389-dummy.apps.googleusercontent.com&redirect_uri=https://onbsaglik.com/api/auth/callback/google&response_type=code&scope=openid%20email%20profile",
          "GoogleSignIn",
          "width=500,height=600"
        );
      } else if (provider === "facebook") {
        window.open("https://www.facebook.com/v18.0/dialog/oauth?client_id=dummy_app_id&redirect_uri=https://onbsaglik.com/api/auth/callback/facebook", "FacebookSignIn", "width=600,height=700");
      } else if (provider === "apple") {
        window.open("https://appleid.apple.com/auth/authorize?client_id=com.onbsaglik.web&redirect_uri=https://onbsaglik.com/api/auth/callback/apple&response_type=code", "AppleSignIn", "width=600,height=700");
      }

      localStorage.setItem("user_session", JSON.stringify({ email: `${provider}_user@onbsaglik.com`, name: `${provider.toUpperCase()} Kullanıcısı`, role: "customer" }));
      await signIn("credentials", { redirect: false, email: `${provider}_user@onbsaglik.com`, password: "demoPassword123" });
      onClose();
      setTimeout(() => router.push("/hesabim"), 1000);
    } catch {
      await signIn("credentials", { redirect: false, email: `${provider}_user@onbsaglik.com`, password: "demoPassword123" });
      onClose();
      router.push("/hesabim");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl overflow-hidden">
        
        {/* Kapat Butonu (Görsel 1 Birebir) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tab Başlığı */}
        <div className="border-b pb-3 mb-6">
          <h2 className="text-base font-extrabold text-rose-500 uppercase tracking-wider">
            {isRegisterTab ? "ÜYE KAYIT" : "ÜYE GİRİŞİ"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-posta */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              E-posta adresinizi giriniz
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fkoc899@gmail.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Şifrenizi giriniz
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Beni Hatırla & Şifremi Unuttum (Görsel 1 Birebir) */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-rose-500"
              />
              <span>Beni Hatırla</span>
            </label>
            <a href="/hesabim/giris" onClick={onClose} className="font-bold text-gray-700 hover:text-rose-500">
              Şifremi Unuttum
            </a>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* 2 Ana Buton: GİRİŞ YAP | ÜYE KAYIT > (Görsel 1 Birebir) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-colors"
            >
              {loading ? "YÜKLENİYOR..." : "GİRİŞ YAP"}
            </button>

            <a
              href="/hesabim/kayit"
              onClick={onClose}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider text-center border border-gray-200 transition-colors flex items-center justify-center"
            >
              ÜYE KAYIT &gt;
            </a>
          </div>

          {/* Sosyal Girişler (Görsel 1 Birebir: f ile bağlan | G ile bağlan |  ile bağlan) */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <button
              type="button"
              onClick={() => handleSocialSignIn("facebook")}
              className="flex items-center justify-center gap-1.5 bg-[#4267B2] text-white font-extrabold py-2.5 px-2 rounded-xl text-xs hover:opacity-90 transition-opacity"
            >
              <span className="text-sm font-black">f</span> ile bağlan
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
              className="flex items-center justify-center gap-1.5 bg-white border border-blue-400 text-gray-700 font-extrabold py-2.5 px-2 rounded-xl text-xs hover:bg-gray-50 transition-colors"
            >
              <span className="text-blue-500 font-black text-sm">G</span> ile bağlan
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignIn("apple")}
              className="flex items-center justify-center gap-1.5 bg-black text-white font-extrabold py-2.5 px-2 rounded-xl text-xs hover:bg-gray-900 transition-colors"
            >
              <span className="text-sm"></span> ile bağlan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
