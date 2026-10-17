'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Truck, RefreshCcw } from 'lucide-react';

/**
 * Canlı SSL ve Orijinal Eczane Güvenlik Şeridi (SecurityTrustBanner)
 * Ana hero reklam banner'ının hemen altına yerleştirilir.
 * Canlı sinyal (pulsing green dot), 256-bit SSL sertifika onayı ve eczane orijinallik garantisini vurgular.
 */
export default function SecurityTrustBanner() {
  return (
    <div className="mx-2 sm:mx-4 my-3 sm:my-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 sm:p-5 shadow-lg border border-emerald-500/30">
        
        {/* Arka plan hafif ışık efekti */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Canlı Sistem Bildirimi Üst Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-300 uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Canlı SSL Güvenliği Aktif (256-Bit SSL Encryption)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-emerald-100/80 bg-white/5 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sertifika No: <strong>ONB-SSL-TLS1.3</strong></span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline text-emerald-300 font-medium">%100 Doğrulanmış Eczane Altyapısı</span>
          </div>
        </div>

        {/* 4 Ana Güvenlik & Garanti Maddesi */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4">
          
          {/* 1. SSL & 3D Secure */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                256-Bit SSL Koruma
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5 leading-snug">
                Tüm ödemeler PayTR 3D Secure ile banka düzeyinde güvence altında.
              </p>
            </div>
          </div>

          {/* 2. %100 Orijinal Ürün */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                %100 Orijinal Eczane
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5 leading-snug">
                Resmi ecza depolarından temin edilen karekodlu ve faturalı ürünler.
              </p>
            </div>
          </div>

          {/* 3. Hızlı & Gizli Kargo */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Hızlı & Gizli Kargo
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5 leading-snug">
                500 TL üzeri kargo bedava, aynı gün korumalı ambalajla sevk.
              </p>
            </div>
          </div>

          {/* 4. Kolay İade & Danışmanlık */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                14 Gün İade Garantisi
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5 leading-snug">
                Koşulsuz iade ve değişim güvencesi ile risk almadan alışveriş yapın.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
