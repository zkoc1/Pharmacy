"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getValidAdminSession, logoutAdmin, AdminSessionData } from "@/lib/authUtils";
import { LogOut, Home, Shield, Package, ShoppingCart, Tag, MessageSquare, HelpCircle, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminSessionData | null>(null);

  useEffect(() => {
    setAdminUser(getValidAdminSession());
  }, [pathname]);

  // Giriş sayfasındayken navigasyon barını gösterme
  if (pathname === "/admin/giris") {
    return null;
  }

  const navLinks = [
    { href: "/admin", label: "Genel Bakış", icon: Shield, exact: true },
    { href: "/admin/urunler", label: "Ürünler", icon: Package },
    { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingCart },
    { href: "/admin/kampanyalar", label: "Kampanyalar", icon: Tag },
    { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
    { href: "/admin/sorular", label: "Soru & Cevap", icon: HelpCircle },
    { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  ];

  const handleLogout = async () => {
    if (confirm("Yönetici oturumunu kapatmak istediğinize emin misiniz?")) {
      await logoutAdmin();
    }
  };

  return (
    <header className="bg-[#0f172a] text-white border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Sol: Logo & Menü Bağlantıları */}
        <div className="flex items-center gap-6 overflow-x-auto py-1 scrollbar-none">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-black text-sm tracking-tight text-white hover:text-emerald-400 shrink-0 transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
              🌿
            </span>
            <span>OnbSağlık Panel</span>
          </Link>

          <nav className="flex items-center gap-1.5 shrink-0 text-xs font-semibold">
            {navLinks.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-gray-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sağ: Kullanıcı Bilgisi, Siteye Dön & Çıkış */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {adminUser && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-[11px] truncate max-w-[140px]">{adminUser.email}</span>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-semibold"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Siteye Dön</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-600/80 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg transition-colors font-bold shadow-sm"
            title="Admin Oturumunu Kapat"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </header>
  );
}
