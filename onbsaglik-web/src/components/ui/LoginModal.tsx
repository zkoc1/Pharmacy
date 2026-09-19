/**
 * Ãœye GiriÅŸi, Ãœye KayÄ±t ve Åifremi Unuttum Pop-up Modal BileÅŸeni
 */

"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  
  // 0: Login, 1: Register, 2: Forgot Password (Email), 3: Forgot Password (OTP), 4: Forgot Password (New Password)
  const [mode, setMode] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetStates = () => {
    setError("");
    setSuccessMsg("");
    setLoading(false);
  };

  const handleClose = () => {
    setMode(0);
    resetStates();
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Mock admin logic
    if (cleanEmail === "admin@onbsaglik.com.tr") {
      localStorage.setItem("admin_session", JSON.stringify({ email: cleanEmail, role: "super_admin" }));
    }

    const res = await signIn("credentials", {
      redirect: false,
      email: cleanEmail,
      password: password || "123456",
    });

    setLoading(false);

    if (res?.error) {
      setError("E-posta adresi veya ÅŸifre hatalÄ±.");
    } else {
      handleClose();
      router.push("/hesabim");
      router.refresh();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail })
    });
    const { error } = await res.json();
    
    setLoading(false);
    
    if (error) {
      setError("Åifre sÄ±fÄ±rlama e-postasÄ± gÃ¶nderilirken bir hata oluÅŸtu: " + (typeof error === "string" ? error : error?.message || "Bilinmeyen hata"));
    } else {
      setSuccessMsg("Åifre sÄ±fÄ±rlama kodunuz e-posta adresinize gÃ¶nderildi.");
      setMode(3); // OTP step
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, token: otpCode.trim() })
    });
    const { error } = await res.json();
    
    setLoading(false);
    
    if (error) {
      setError("GirdiÄŸiniz kod hatalÄ± veya sÃ¼resi dolmuÅŸ.");
    } else {
      setSuccessMsg("Kod doÄŸrulandÄ±! LÃ¼tfen yeni ÅŸifrenizi belirleyin.");
      setMode(4);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: newPassword })
    });
    const { error } = await res.json();
    
    setLoading(false);
    
    if (error) {
      setError("Åifre gÃ¼ncellenirken bir hata oluÅŸtu: " + (typeof error === "string" ? error : error?.message || "Bilinmeyen hata"));
    } else {
      setSuccessMsg("Åifreniz baÅŸarÄ±yla gÃ¼ncellendi! GiriÅŸ yapabilirsiniz.");
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password: newPassword,
      });
      if (!loginRes?.error) {
         handleClose();
         router.push("/hesabim");
         router.refresh();
      } else {
         setMode(0);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl overflow-hidden">
        
        {/* Kapat Butonu */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tab BaÅŸlÄ±ÄŸÄ± */}
        <div className="border-b pb-3 mb-6 flex items-center gap-3">
          {mode >= 2 && (
            <button type="button" onClick={() => { resetStates(); setMode(0); }} className="text-gray-500 hover:text-rose-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-base font-extrabold text-rose-500 uppercase tracking-wider">
            {mode === 0 ? "ÃœYE GÄ°RÄ°ÅÄ°" : mode === 1 ? "ÃœYE KAYIT" : "ÅÄ°FREMÄ° UNUTTUM"}
          </h2>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">
            âš  {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200">
            âœ“ {successMsg}
          </div>
        )}

        {/* ============================== */}
        {/* MODE 0: LOGIN */}
        {/* ============================== */}
        {mode === 0 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresinizi giriniz"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Åifre</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Åifrenizi giriniz"
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
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-rose-500"
                />
                <span>Beni HatÄ±rla</span>
              </label>
              <button type="button" onClick={() => { resetStates(); setMode(2); }} className="font-bold text-gray-700 hover:text-rose-500">
                Åifremi Unuttum
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                {loading ? "YÃœKLENÄ°YOR..." : "GÄ°RÄ°Å YAP"}
              </button>
              <a
                href="/hesabim/kayit"
                onClick={handleClose}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider text-center border border-gray-200 transition-colors flex items-center justify-center"
              >
                ÃœYE KAYIT &gt;
              </a>
            </div>
          </form>
        )}

        {/* ============================== */}
        {/* MODE 2: FORGOT PASSWORD (EMAIL) */}
        {/* ============================== */}
        {mode === 2 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              KayÄ±tlÄ± e-posta adresinizi girin. Size ÅŸifrenizi sÄ±fÄ±rlamanÄ±z iÃ§in bir kod gÃ¶ndereceÄŸiz.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresinizi giriniz"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-colors disabled:opacity-70"
            >
              {loading ? "GÃ–NDERÄ°LÄ°YOR..." : "KOD GÃ–NDER"}
            </button>
          </form>
        )}

        {/* ============================== */}
        {/* MODE 3: FORGOT PASSWORD (OTP) */}
        {/* ============================== */}
        {mode === 3 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              <strong className="text-gray-900">{email}</strong> adresine bir doÄŸrulama kodu gÃ¶nderdik. LÃ¼tfen kodu aÅŸaÄŸÄ±ya girin.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">DoÄŸrulama Kodu</label>
              <input
                type="text"
                required
                maxLength={8}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl tracking-[0.5em] font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-colors disabled:opacity-70"
            >
              {loading ? "DOÄRULANIYOR..." : "KODU DOÄRULA"}
            </button>
          </form>
        )}

        {/* ============================== */}
        {/* MODE 4: FORGOT PASSWORD (NEW PASS) */}
        {/* ============================== */}
        {mode === 4 && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              LÃ¼tfen yeni ÅŸifrenizi belirleyin.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Yeni Åifre</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
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
            <button
              type="submit"
              disabled={loading || newPassword.length < 6}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-colors disabled:opacity-70"
            >
              {loading ? "KAYDEDÄ°LÄ°YOR..." : "ÅÄ°FREYÄ° GÃœNCELLE"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
