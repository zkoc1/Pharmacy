/**
 * Ödeme Başarılı Sayfası — /odeme/basarili
 * Sipariş özeti, takip numarası, kargo ve tıklanabilir ürün kartları içerir.
 */

"use client";

import { useEffect, Suspense } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/products";
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, Home } from "lucide-react";

function OdemeBasariliContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((s) => s.clearCart);
  const { getOrderById, fetchOrders } = useOrderStore();

  useEffect(() => {
    clearCart();
    fetchOrders();
  }, [clearCart, fetchOrders]);

  const order = orderId ? getOrderById(orderId) : null;

  return (
    <div className="container-custom max-w-2xl py-16 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-inner">
          <CheckCircle2 size={44} />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900">Siparişiniz Başarıyla Alındı!</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Ödemeniz onaylandı ve siparişiniz hazırlanmaya başlandı. Bilgilendirme ve kargo detayları e-posta adresinize iletilecektir.
        </p>

        {orderId && (
          <div className="inline-block bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl text-xs font-mono font-bold text-gray-800">
            Sipariş No: <span className="text-emerald-700 font-extrabold">{orderId}</span>
          </div>
        )}
      </div>

      {order && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 uppercase border-b pb-3 flex items-center gap-2">
            <ShoppingBag size={16} className="text-emerald-600" /> Sipariş Detayları
          </h3>

          {/* Tıklanabilir Ürün Listesi */}
          <div className="space-y-2.5">
            {order.items.map((it: any, idx: number) => {
              const href = it.slug ? `/urun/${it.slug}` : `/ara?q=${encodeURIComponent(it.name)}`;
              return (
                <Link
                  key={idx}
                  href={href}
                  className="flex items-center justify-between bg-gray-50/70 hover:bg-emerald-50/40 p-3 rounded-2xl border border-gray-100 hover:border-emerald-300 transition-all text-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-xl p-1 border">
                      <Image src={it.image || "/placeholder.png"} alt={it.name} fill className="object-contain" unoptimized />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-400 text-[10px] uppercase block">{it.brand}</span>
                      <span className="font-bold text-gray-800 group-hover:text-emerald-700 truncate block transition-colors">
                        {it.name} &rarr;
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">{it.quantity} Adet</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm ml-4 flex-shrink-0">
                    {formatPrice(it.price * it.quantity)}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100 pt-3">
            <div>
              <span className="font-bold text-gray-400 text-[10px] uppercase block">Kargo Firması</span>
              <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                <Truck size={14} className="text-emerald-600" /> {order.carrier}
              </span>
            </div>
            <div>
              <span className="font-bold text-gray-400 text-[10px] uppercase block">Ödeme Şekli</span>
              <span className="font-bold text-gray-800 mt-0.5 block">{order.paymentMethod}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-xs font-bold text-gray-600">Ödenen Toplam:</span>
            <span className="text-lg font-extrabold text-rose-500">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      {/* Yönlendirme Butonları */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/hesabim/siparislerim"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
        >
          Siparişlerimi Görüntüle <ArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
        >
          <Home size={14} /> Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

export default function OdemeBasarili() {
  return (
    <Suspense fallback={<div className="container-custom py-20 text-center">Yükleniyor...</div>}>
      <OdemeBasariliContent />
    </Suspense>
  );
}
