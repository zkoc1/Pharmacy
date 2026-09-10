/**
 * Kullanıcı Siparişlerim Sayfası — /hesabim/siparislerim
 * Giriş yapan kullanıcının kendi siparişlerini (userEmail) listeler.
 * Ürünlere tıklayarak doğrudan ürün detay sayfasına (/urun/[slug]) gidilebilir.
 */

"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useOrderStore, OrderStatus } from "@/stores/orderStore";
import { formatPrice } from "@/lib/products";

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  "Ödeme Bekliyor":      { color: "#f59e0b", bg: "#fef3c7", icon: <Clock size={14} /> },
  "Mail Order Bekliyor": { color: "#ea580c", bg: "#ffedd5", icon: <CreditCard size={14} /> },
  "Hazırlanıyor":        { color: "#3b82f6", bg: "#dbeafe", icon: <Package size={14} /> },
  "Kargoda":             { color: "#8b5cf6", bg: "#ede9fe", icon: <Truck size={14} /> },
  "Teslim Edildi":       { color: "#10b981", bg: "#d1fae5", icon: <CheckCircle size={14} /> },
  "İptal Edildi":        { color: "#ef4444", bg: "#fee2e2", icon: <XCircle size={14} /> },
};

export default function SiparislerimSayfasi() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { orders } = useOrderStore();

  const currentUserEmail = session?.user?.email || "";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/hesabim/giris");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Siparişler yükleniyor...
      </div>
    );
  }

  // Kullanıcıya özel sipariş filtreleme (Admin tümünü görür)
  const userOrders =
    currentUserEmail === "admin@onbsaglik.com.tr"
      ? orders
      : orders.filter(
          (o) => o.customerEmail && o.customerEmail.toLowerCase() === currentUserEmail.toLowerCase()
        );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 font-sans">
      <div className="container-custom max-w-4xl space-y-6">
        {/* Üst Navigasyon & Başlık */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/hesabim"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} /> Hesabıma Geri Dön
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-emerald-600" /> Sipariş Geçmişim
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Toplam {userOrders.length} adet siparişiniz bulunmaktadır ({currentUserEmail})
              </p>
            </div>
          </div>

          <Link
            href="/urunler"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
          >
            Alışverişe Devam Et <ChevronRight size={14} />
          </Link>
        </div>

        {/* Sipariş Listesi */}
        {userOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Henüz Bir Siparişiniz Yok</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Sağlık ve dermokozmetik ihtiyaçlarınız için yüzlerce orijinal eczane ürününü hemen keşfedin.
            </p>
            <Link
              href="/urunler"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((ord) => {
              const cfg = STATUS_CONFIG[ord.status] || {
                color: "#64748b",
                bg: "#f1f5f9",
                icon: <Package size={14} />,
              };

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4"
                >
                  {/* Başlık Satırı */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <span className="font-extrabold text-sm text-gray-900 block">{ord.id}</span>
                      <span className="text-xs text-gray-500 font-medium">
                        Sipariş Tarihi: {ord.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        style={{ background: cfg.bg, color: cfg.color }}
                        className="font-extrabold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        {cfg.icon} {ord.status}
                      </span>
                    </div>
                  </div>

                  {/* Ürünler Listesi — Tıklanabilir Ürün Linkleri */}
                  <div className="space-y-2.5">
                    {ord.items.map((it, idx) => {
                      const productHref = it.slug
                        ? `/urun/${it.slug}`
                        : `/ara?q=${encodeURIComponent(it.name)}`;

                      return (
                        <Link
                          key={idx}
                          href={productHref}
                          className="flex items-center justify-between bg-gray-50/70 hover:bg-emerald-50/40 p-3 rounded-2xl border border-gray-100/80 hover:border-emerald-200 text-xs transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-xl p-1 border group-hover:border-emerald-300 transition-colors">
                              <Image
                                src={it.image || "/placeholder.png"}
                                alt={it.name}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <span className="font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border text-[11px]">
                              {it.quantity}x
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-400 text-[10px] uppercase block">
                                {it.brand}
                              </span>
                              <span className="font-bold text-gray-800 group-hover:text-emerald-700 truncate block transition-colors flex items-center gap-1">
                                {it.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                            </div>
                          </div>
                          <span className="font-extrabold text-emerald-600 text-sm ml-4 flex-shrink-0">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Detay Bilgileri & Kargo Takip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-400 block mb-0.5 text-[10px] uppercase">
                        Kargo Bilgisi
                      </span>
                      <span className="font-bold text-gray-800">{ord.carrier}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block mb-0.5 text-[10px] uppercase">
                        Ödeme Türü
                      </span>
                      <span className="font-bold text-gray-800">{ord.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block mb-0.5 text-[10px] uppercase">
                        Teslimat Adresi
                      </span>
                      <span className="font-bold text-gray-800 truncate block">
                        {ord.deliveryAddress}
                      </span>
                    </div>
                  </div>

                  {/* Kargo Durum Çubuğu (Stepper) */}
                  {ord.status === "İptal Edildi" ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700">
                      <XCircle size={24} />
                      <div>
                        <p className="font-extrabold text-sm">Sipariş İptal Edildi</p>
                        <p className="text-xs font-medium">Bu sipariş iptal edilmiş veya ödemesi başarısız olmuştur.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      {(() => {
                        const steps = ["Sipariş Alındı", "Hazırlanıyor", "Kargoya Verildi", "Dağıtıma Çıktı", "Teslim Edildi"];
                        
                        let currentStepIndex = 0;
                        if (["Ödeme Bekliyor", "PayTR Ödeme Bekliyor", "Mail Order Bekliyor"].includes(ord.status)) currentStepIndex = 0;
                        else if (ord.status === "Hazırlanıyor") currentStepIndex = 1;
                        else if (ord.status === "Kargoda") currentStepIndex = 2; // Kargoya Verildi
                        else if (ord.status === "Teslim Edildi") currentStepIndex = 4;
                        
                        // Kargo takibi için
                        if (ord.trackingNumber && ord.status === "Hazırlanıyor") currentStepIndex = 2; // Takip no girildiyse kargoya verilmiştir

                        return (
                          <div className="relative flex items-center justify-between">
                            {/* Arkadaki çizgi */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                            {/* İlerleyen yeşil çizgi */}
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {/* Adımlar */}
                            {steps.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex;
                              const isCurrent = idx === currentStepIndex;
                              return (
                                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-300"}`}>
                                    {isCompleted ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-200"></div>}
                                  </div>
                                  <span className={`text-[9px] sm:text-[11px] font-extrabold text-center hidden sm:block max-w-[60px] leading-tight ${isCurrent ? "text-emerald-700" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Kargo Takip Linki Varsa */}
                  {ord.trackingNumber && ord.status !== "İptal Edildi" && (
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold text-blue-800/60 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                          <Truck size={14} /> Kargo Takip Numarası
                        </p>
                        <p className="font-extrabold text-blue-900 text-sm">
                          {ord.trackingNumber}
                        </p>
                      </div>
                      <a 
                        href={`https://www.google.com/search?q=${ord.carrier}+kargo+sorgulama+${ord.trackingNumber}`}
                        target="_blank" rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        Kargomu Takip Et <ExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* Toplam Tutar */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500 font-semibold">
                      Ödenen Genel Toplam
                    </span>
                    <span className="text-base font-extrabold text-rose-600">
                      {formatPrice(ord.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Alt Geri Dön Linki */}
        <div className="text-center pt-4">
          <Link
            href="/hesabim"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={14} /> Hesabım Ana Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
