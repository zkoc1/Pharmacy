'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Truck, RefreshCcw, Award } from 'lucide-react';

/**
 * Canlı SSL ve Orijinal Eczane Güvenlik & Sertifika Şeridi (SecurityTrustBanner)
 * Kullanıcının isteği doğrultusunda yeşil yerine altın sarısı, kırmızı ve lacivert
 * resmi sertifika (award/certificate) renk paletine dönüştürülmüştür.
 */
export default function SecurityTrustBanner() {
  return (
    <div className="mx-2 sm:mx-4 my-3 sm:my-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#121c35] to-[#1c0f1e] text-white p-4 sm:p-5 shadow-xl border-2 border-amber-400/50 ring-1 ring-amber-500/20">
        
        {/* Sertifika Arka Plan Altın & Kırmızı Işık Efektleri */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

        {/* Canlı Sertifika & Güvenlik Bildirim Üst Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-amber-400/20 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Altın Madalyon & Kırmızı Sertifika İkonu */}
            <div className="relative flex items-center justify-center">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 shadow-md">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                256-Bit SSL Sertifikalı Güvenli Altyapı
              </span>
              <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Resmi Tescilli
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-amber-100/90 bg-red-950/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-amber-400/30 shadow-inner">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Sertifika No: <strong className="text-amber-300">ONB-SSL-TLS1.3</strong></span>
            <span className="hidden sm:inline text-amber-500/50">|</span>
            <span className="hidden sm:inline text-red-200 font-medium">%100 Doğrulanmış Eczane Altyapısı</span>
          </div>
        </div>

        {/* 4 Ana Sertifika & Güvenlik Maddesi (Altın Sarı & Kırmızı Vurgular) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 relative z-10">
          
          {/* 1. SSL & 3D Secure (Sarı / Altın Vurgulu) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-amber-500/15 hover:border-amber-400/40 transition-all">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-tight">
                256-Bit SSL Koruma
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-100/70 mt-0.5 leading-snug">
                BKM ve PayTR 3D Secure onaylı, banka düzeyinde şifreli ödeme.
              </p>
            </div>
          </div>

          {/* 2. Orijinallik Sertifikası (Kırmızı / Bordo Vurgulu) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-red-500/15 hover:border-red-400/40 transition-all">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-red-300 tracking-tight">
                Orijinallik Sertifikası
              </h4>
              <p className="text-[11px] sm:text-xs text-red-100/70 mt-0.5 leading-snug">
                Sağlık Bakanlığı İTS ve ecza deposu karekodlu %100 orijinal ürün.
              </p>
            </div>
          </div>

          {/* 3. Sigortalı & Hızlı Kargo (Sarı / Altın Vurgulu) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-amber-500/15 hover:border-amber-400/40 transition-all">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-tight">
                Sigortalı Hızlı Kargo
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-100/70 mt-0.5 leading-snug">
                500 TL üzeri ücretsiz, hasara karşı tam korumalı ambalajla sevk.
              </p>
            </div>
          </div>

          {/* 4. 14 Gün Yasal Teminat (Kırmızı / Bordo Vurgulu) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-red-500/15 hover:border-red-400/40 transition-all">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 shrink-0 shadow-xs">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-red-300 tracking-tight">
                14 Gün İade & e-Fatura
              </h4>
              <p className="text-[11px] sm:text-xs text-red-100/70 mt-0.5 leading-snug">
                Adınıza resmi e-Arşiv faturalı, yasal iade ve değişim teminatı.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
