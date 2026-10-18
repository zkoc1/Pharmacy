'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Truck, RefreshCcw, Award } from 'lucide-react';

/**
 * Canlı SSL ve Orijinal Eczane Güvenlik & Sertifika Şeridi (SecurityTrustBanner)
 * Ekranı boğmayan, ferah ve aydınlık zemin üzerine altın sarısı, kırmızı ve lacivert
 * resmi sertifika (award/certificate) renk paleti ile yeniden optimize edilmiştir.
 */
export default function SecurityTrustBanner() {
  return (
    <div className="mx-2 sm:mx-4 my-3 sm:my-4">
      {/* Ferah, Aydınlık ve Altın Yaldız Çerçeveli Sertifika Kartı */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50/40 via-white to-red-50/30 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border-2 border-amber-300/80 ring-1 ring-amber-400/20">
        
        {/* Zarif Altın & Kırmızı Arka Plan Işıltıları (Ferah ve Açık Ton) */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-200/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-300 via-red-400 to-amber-300 opacity-60" />

        {/* Canlı Sertifika & Güvenlik Bildirim Üst Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-amber-200/70 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Altın Madalyon & Canlı Sinyal */}
            <div className="relative flex items-center justify-center">
              <span className="relative flex h-3 w-3 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-white shadow-xs">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-800 uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                256-Bit SSL Sertifikalı Güvenli Altyapı
              </span>
              <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Resmi Tescilli
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-700 bg-amber-100/50 px-3.5 py-1.5 rounded-full border border-amber-300/80 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Sertifika No: <strong className="text-slate-900 font-bold">ONB-SSL-TLS1.3</strong></span>
            <span className="hidden sm:inline text-amber-400">|</span>
            <span className="hidden sm:inline text-red-700 font-semibold">%100 Doğrulanmış Eczane Altyapısı</span>
          </div>
        </div>

        {/* 4 Ana Sertifika & Güvenlik Maddesi (Ferah Zemin & Canlı Sarı-Kırmızı Rozetler) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 relative z-10">
          
          {/* 1. SSL & 3D Secure (Altın Sarısı Rozet) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 hover:bg-amber-50/60 border border-amber-200/60 hover:border-amber-300 transition-all shadow-2xs">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-300/60 shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                256-Bit SSL Koruma
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                BKM ve PayTR 3D Secure onaylı, banka düzeyinde şifreli ödeme.
              </p>
            </div>
          </div>

          {/* 2. Orijinallik Sertifikası (Sertifika Kırmızısı Rozet) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 hover:bg-red-50/60 border border-red-200/60 hover:border-red-300 transition-all shadow-2xs">
            <div className="p-2 rounded-lg bg-red-100 text-red-700 border border-red-300/60 shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                Orijinallik Sertifikası
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                Sağlık Bakanlığı İTS ve ecza deposu karekodlu %100 orijinal ürün.
              </p>
            </div>
          </div>

          {/* 3. Sigortalı & Hızlı Kargo (Altın Sarısı Rozet) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 hover:bg-amber-50/60 border border-amber-200/60 hover:border-amber-300 transition-all shadow-2xs">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-300/60 shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                Sigortalı Hızlı Kargo
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                500 TL üzeri ücretsiz, hasara karşı tam korumalı ambalajla sevk.
              </p>
            </div>
          </div>

          {/* 4. 14 Gün Yasal Teminat (Sertifika Kırmızısı Rozet) */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 hover:bg-red-50/60 border border-red-200/60 hover:border-red-300 transition-all shadow-2xs">
            <div className="p-2 rounded-lg bg-red-100 text-red-700 border border-red-300/60 shrink-0 shadow-xs">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                14 Gün İade & e-Fatura
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                Adınıza resmi e-Arşiv faturalı, yasal iade ve değişim teminatı.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
