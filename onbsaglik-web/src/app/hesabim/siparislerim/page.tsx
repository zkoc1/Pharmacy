/**
 * Kullanıcı Siparişlerim Sayfası — /hesabim/siparislerim
 * Bağımsız tam ekran sipariş geçmişi ve detay takibi sayfası.
 * Doğal tarayıcı geçmişi ve belirgin geri dön butonu içerir.
 */

"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, CreditCard, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/hesabim/giris");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Siparişler yükleniyor...</div>;
  }

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
                Toplam {orders.length} adet siparişiniz bulunmaktadır
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
          >
            Alışverişe Devam Et <ChevronRight size={14} />
          </Link>
        </div>

        {/* Sipariş Listesi */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Henüz Bir Siparişiniz Yok</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Sağlık ve dermokozmetik ihtiyaçlarınız için yüzlerce orijinal eczane ürününü hemen keşfedin.
            </p>
            <Link
              href="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const cfg = STATUS_CONFIG[ord.status] || { color: "#64748b", bg: "#f1f5f9", icon: <Package size={14} /> };

              return (
                <div key={ord.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  {/* Başlık Satırı */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <span className="font-extrabold text-sm text-gray-900 block">{ord.id}</span>
                      <span className="text-xs text-gray-500 font-medium">Sipariş Tarihi: {ord.date}</span>
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

                  {/* Ürünler Listesi */}
                  <div className="space-y-2.5">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50/70 p-3 rounded-2xl border border-gray-100/80 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border text-[11px]">{it.quantity}x</span>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-400 text-[10px] uppercase block">{it.brand}</span>
                            <span className="font-bold text-gray-800 truncate block">{it.name}</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-600 text-sm ml-4 flex-shrink-0">
                          {formatPrice(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Detay Bilgileri & Kargo Takip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-400 block mb-0.5 text-[10px] uppercase">Kargo Bilgisi</span>
                      <span className="font-bold text-gray-800">{ord.carrier}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block mb-0.5 text-[10px] uppercase">Ödeme Türü</span>
                      <span className="font-bold text-gray-800">{ord.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block mb-0.5 text-[10px] uppercase">Teslimat Adresi</span>
                      <span className="font-bold text-gray-800 truncate block">{ord.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Kargo Takip No Varsa */}
                  {ord.trackingNumber && (
                    <div className="bg-purple-50 border border-purple-200 text-purple-900 p-3.5 rounded-2xl text-xs flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        <Truck size={16} className="text-purple-600" /> Kargo Takip No: <span className="font-extrabold underline">{ord.trackingNumber}</span>
                      </span>
                      <span className="text-[11px] bg-purple-200/60 px-2 py-0.5 rounded-lg text-purple-800">Kargoya Verildi</span>
                    </div>
                  )}

                  {/* Toplam Tutar */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500 font-semibold">Ödenen Genel Toplam</span>
                    <span className="text-base font-extrabold text-rose-600">{formatPrice(ord.total)}</span>
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
