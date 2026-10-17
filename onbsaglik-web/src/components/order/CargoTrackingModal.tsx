'use client';

import React, { useState } from 'react';
import {
  X,
  Truck,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Clock,
  PackageCheck,
  Building2,
  Phone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { OrderRecord } from '@/stores/orderStore';

interface CargoTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
}

/**
 * Kargo firmalarının resmi takip URL'lerini ve çağrı merkezlerini eşler.
 */
export function getCarrierInfo(carrierName: string = '', trackingNumber: string = '') {
  const c = carrierName.toLowerCase().trim();
  const num = encodeURIComponent(trackingNumber.trim());

  if (c.includes('hepsi') || c.includes('jet')) {
    return {
      name: 'HepsiJet',
      color: 'bg-orange-500 text-white',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      phone: '0850 558 0 333',
      trackingUrl: `https://www.hepsijet.com/gonderi-takibi/${num}`,
      logoText: 'hepsijet'
    };
  }

  if (c.includes('yurtiçi') || c.includes('yurtici')) {
    return {
      name: 'Yurtiçi Kargo',
      color: 'bg-yellow-500 text-neutral-900',
      badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      phone: '444 99 99',
      trackingUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${num}`,
      logoText: 'Yurtiçi Kargo'
    };
  }

  if (c.includes('aras')) {
    return {
      name: 'Aras Kargo',
      color: 'bg-red-600 text-white',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      phone: '444 25 52',
      trackingUrl: `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${num}`,
      logoText: 'Aras Kargo'
    };
  }

  if (c.includes('mng')) {
    return {
      name: 'MNG Kargo',
      color: 'bg-blue-600 text-white',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      phone: '0850 222 06 06',
      trackingUrl: `https://service.mngkargo.com.tr/iactive/popup/kargotakip.asp?k=${num}`,
      logoText: 'MNG Kargo'
    };
  }

  if (c.includes('sürat') || c.includes('surat')) {
    return {
      name: 'Sürat Kargo',
      color: 'bg-red-500 text-white',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      phone: '0850 202 02 02',
      trackingUrl: `https://suratkargo.com.tr/KargoSorgula/?kargotakipno=${num}`,
      logoText: 'Sürat Kargo'
    };
  }

  if (c.includes('ptt')) {
    return {
      name: 'PTT Kargo',
      color: 'bg-amber-400 text-neutral-900',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      phone: '444 1 788',
      trackingUrl: `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${num}`,
      logoText: 'PTT Kargo'
    };
  }

  if (c.includes('trendyol') || c.includes('express')) {
    return {
      name: 'Trendyol Express',
      color: 'bg-orange-600 text-white',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      phone: '0850 758 75 85',
      trackingUrl: `https://kargotakip.trendyol.com/?trackingCode=${num}`,
      logoText: 'Trendyol Express'
    };
  }

  // Varsayılan / Diğer Kargo
  return {
    name: carrierName || 'Kargo Firması',
    color: 'bg-emerald-600 text-white',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    phone: '0850 558 0 333',
    trackingUrl: `https://www.hepsijet.com/gonderi-takibi/${num}`,
    logoText: carrierName || 'HepsiJet'
  };
}

export default function CargoTrackingModal({
  isOpen,
  onClose,
  order
}: CargoTrackingModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const carrierInfo = getCarrierInfo(order.carrier, order.trackingNumber);

  const handleCopy = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sipariş durumuna göre aşama indeksi belirleme (0: Sipariş Alındı, 1: Hazırlanıyor, 2: Kargoya Verildi, 3: Yolda/Dağıtımda, 4: Teslim Edildi)
  let currentStep = 1; // Varsayılan: Hazırlanıyor
  if (order.status === 'Ödeme Bekliyor' || order.status === 'Mail Order Bekliyor') {
    currentStep = 0;
  } else if (order.status === 'Hazırlanıyor') {
    currentStep = 1;
  } else if (order.status === 'Kargoda') {
    currentStep = 3; // Kargo şubesinde / yolda
  } else if (order.status === 'Teslim Edildi') {
    currentStep = 4;
  }

  // Tarih biçimlendirme & tahmini teslimat hesabı
  const orderDateStr = order.date || '';

  const trackingEvents = [
    {
      title: 'Siparişiniz Alındı & Onaylandı',
      desc: 'Siparişiniz OnbSağlık sistemine ulaştı, ödemeniz onaylandı ve faturalandırıldı.',
      time: orderDateStr || '16.10.2026 20:07',
      icon: <PackageCheck size={18} />,
      stepIndex: 0
    },
    {
      title: 'Depoda Hazırlanıyor & Barkodlandı',
      desc: 'Orijinal eczane ürünleriniz özenle koruyucu ambalajla paketlendi, kargo sevk etiketi oluşturuldu.',
      time: orderDateStr ? `${orderDateStr.split(' ')[0]} 21:15` : '16.10.2026 21:15',
      icon: <Clock size={18} />,
      stepIndex: 1
    },
    {
      title: `Kargoya Teslim Edildi (${carrierInfo.name})`,
      desc: `Paketiniz ${carrierInfo.name} yetkilisine teslim edildi ve takip barkodu sisteme işlendi.`,
      time: currentStep >= 2 ? '17.10.2026 10:30' : 'İşlem bekleniyor',
      icon: <Truck size={18} />,
      stepIndex: 2
    },
    {
      title: 'Transfer Merkezinde / Yolda',
      desc: `Gönderiniz varış transfer merkezine ulaştı ve dağıtım şubesine sevk ediliyor.`,
      time: currentStep >= 3 ? '17.10.2026 14:45' : 'İşlem bekleniyor',
      icon: <Building2 size={18} />,
      stepIndex: 3
    },
    {
      title: 'Kurye Dağıtımda & Teslimat',
      desc: `Kuryemiz paketinizi teslim etmek üzere adresinize yönlendirildi.`,
      time: currentStep >= 4 ? 'Teslim Edildi' : 'Teslimat bekleniyor',
      icon: <MapPin size={18} />,
      stepIndex: 4
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık & Kargo Firması Rozeti */}
        <div className="bg-gradient-to-r from-gray-900 via-neutral-900 to-gray-800 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Kargo Takip Detayı</h3>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${carrierInfo.badgeBg}`}>
                  {carrierInfo.name}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Sipariş No: <span className="font-mono text-emerald-300 font-bold">{order.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Gövde - Kaydırılabilir */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Takip Numarası & Tek Tık Kopyalama Kutusu */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-blue-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" /> Kargo Takip Kodu
              </span>
              <p className="text-lg font-black text-gray-900 font-mono tracking-tight mt-0.5">
                {order.trackingNumber || 'Barkod Üretiliyor...'}
              </p>
            </div>

            {order.trackingNumber && (
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-200 shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Kodu Kopyala
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tahmini Teslimat & Teslimat Bilgisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl">
              <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">
                📍 Teslimat Adresi
              </span>
              <p className="font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                {order.deliveryAddress || 'Belirtilmemiş'}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl">
              <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">
                ⚡ Kargo Servisi
              </span>
              <p className="font-semibold text-gray-800">
                {carrierInfo.name} — Standart Hızlı Teslimat
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <Clock size={12} /> Tahmini 1-2 iş gününde kapınızda
              </p>
            </div>
          </div>

          {/* Trendyol Tarzı Kargo Hareketleri (Timeline) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Gönderi Hareketleri
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
              {trackingEvents.map((evt, idx) => {
                const isPassed = evt.stepIndex < currentStep;
                const isCurrent = evt.stepIndex === currentStep;

                return (
                  <div key={idx} className="relative flex items-start gap-3 group">
                    {/* Yuvarlak Aşama Noktası */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                        isPassed
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                          : 'bg-white border-2 border-gray-200 text-gray-300'
                      }`}
                    >
                      {isPassed ? (
                        <Check size={13} strokeWidth={3} />
                      ) : (
                        <span className="text-[10px]">{idx + 1}</span>
                      )}
                    </div>

                    {/* Metin İçeriği */}
                    <div className="flex-1 bg-white p-3 rounded-2xl border border-gray-100/80 shadow-xs hover:border-gray-200 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-emerald-700'
                              : isPassed
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {evt.title}
                        </p>
                        <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                          {evt.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {evt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bilgilendirme Notu */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Kargo teslimatında paketinizi teslim alırken hasar olup olmadığını kontrol ediniz. Herhangi bir sorunda kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> tutturabilirsiniz.
            </p>
          </div>

        </div>

        {/* Alt Aksiyon Butonları */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 w-full sm:w-auto">
            <Phone size={14} className="text-gray-400" />
            <span>Kargo Çağrı Merkezi: <strong className="text-gray-800">{carrierInfo.phone}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Kapat
            </button>

            {order.trackingNumber && (
              <a
                href={carrierInfo.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {carrierInfo.name} Sitesinde Sorgula <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
