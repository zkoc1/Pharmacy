/**
 * Sepet sayfası — /sepet rotası (Görsel 2 Birebir)
 * Sepet içeriği, miktar yönetimi, sipariş notu, kupon kodu ve Sepete Özel Kampanyalar.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/products";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ChevronLeft, Gift, Printer, Calendar, RefreshCw, BookmarkPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

export default function SepetSayfasi() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [showNotes, setShowNotes] = useState<Record<number, boolean>>({});
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);

  const total = getTotalPrice();
  const grandTotal = Math.max(0, total - discountAmount);

  useEffect(() => {
    import("@/data/products.json").then((m) => {
      const all = m.default as Product[];
      setSpecialOffers(all.slice(0, 4));
    });
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "ONB100") {
      setDiscountAmount(100);
      setCouponMsg("🎉 100 TL İndirim Uygulandı!");
    } else if (code === "YAZ50") {
      setDiscountAmount(50);
      setCouponMsg("🎉 50 TL İndirim Uygulandı!");
    } else {
      setDiscountAmount(0);
      setCouponMsg("⚠️ Geçersiz veya süresi dolmuş kupon kodu.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingCart size={64} style={{ margin: "0 auto 16px", color: "var(--color-text-light)" }} />
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Sepetiniz Boş</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>Alışverişe başlamak için ürünleri keşfedin.</p>
        <Link href="/" className="btn-primary">Alışverişe Başla</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        
        {/* Üst Başlık & Alışverişe Devam Et Butonu (Görsel 2 Birebir) */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="text-rose-500" /> SEPETİM
          </h1>
          <Link
            href="/urunler"
            className="bg-gray-900 hover:bg-black text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft size={16} /> ALIŞVERİŞE DEVAM ET
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Kolon: Sepetteki Ürünler Listesi (Görsel 2 Birebir) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
              
              {/* Tablo Başlıkları */}
              <div className="grid grid-cols-12 text-xs font-extrabold text-gray-400 border-b pb-3 mb-4">
                <span className="col-span-6">Ürün Bilgisi</span>
                <span className="col-span-2 text-center">Adet</span>
                <span className="col-span-2 text-center">Fiyat</span>
                <span className="col-span-1 text-center">Toplam</span>
                <span className="col-span-1 text-right">Sil</span>
              </div>

              {/* Ürün Satırları */}
              <div className="space-y-4 divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="grid grid-cols-12 items-center pt-4 text-xs">
                    
                    {/* Ürün Detayı */}
                    <div className="col-span-6 flex gap-3 items-center">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-xl p-1 border">
                        <Image src={product.images?.[0] || "/placeholder.png"} alt={product.name} fill className="object-contain" unoptimized />
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 block uppercase">{product.brand}</span>
                        <p className="font-bold text-gray-800 line-clamp-2">{product.name}</p>
                        
                        {/* Sipariş Notu Butonu */}
                        <button
                          onClick={() => setShowNotes((p) => ({ ...p, [product.id]: !p[product.id] }))}
                          className="mt-1 text-[11px] font-bold text-gray-500 hover:text-emerald-600 bg-gray-100 px-2 py-0.5 rounded-md"
                        >
                          Sipariş Notu +
                        </button>
                        {showNotes[product.id] && (
                          <input
                            type="text"
                            placeholder="Bu ürün için özel not ekleyin..."
                            value={notes[product.id] || ""}
                            onChange={(e) => setNotes((p) => ({ ...p, [product.id]: e.target.value }))}
                            className="mt-2 w-full p-1.5 border rounded-lg text-xs bg-gray-50"
                          />
                        )}
                      </div>
                    </div>

                    {/* Adet Miktar Kontrolü */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))} className="px-2 py-1 text-rose-500 hover:bg-rose-50 font-extrabold"><Minus size={12} /></button>
                        <span className="px-2 py-1 font-bold">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-rose-500 hover:bg-rose-50 font-extrabold"><Plus size={12} /></button>
                      </div>
                    </div>

                    {/* Birim Fiyat */}
                    <div className="col-span-2 text-center font-bold text-rose-500">
                      {formatPrice(product.price)}
                    </div>

                    {/* Toplam Fiyat */}
                    <div className="col-span-1 text-center font-extrabold text-rose-600">
                      {formatPrice(product.price * quantity)}
                    </div>

                    {/* Sil Butonu */}
                    <div className="col-span-1 text-right">
                      <button onClick={() => removeItem(product.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Alt İşlemler Çubuğu (Görsel 2 Birebir: Alışveriş Listeme Ekle, Sepeti Temizle, Sepeti Güncelle vb.) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-6 mt-6 border-t border-gray-100 text-xs">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => alert("Sepetiniz favori listenize eklendi.")} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1.5">
                    <BookmarkPlus size={14} /> Alışveriş Listeme Ekle
                  </button>
                  <button onClick={clearCart} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1.5">
                    <Trash2 size={14} /> Sepeti Temizle
                  </button>
                  <button onClick={() => window.location.reload()} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1.5">
                    <RefreshCw size={14} /> Sepeti Güncelle
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1.5">
                    <Printer size={14} /> Yazdır
                  </button>
                  <button onClick={() => alert("Kargolama tarihi varsayılan olarak bugün seçilmiştir.")} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1.5">
                    <Calendar size={14} /> Kargoya verilmesini istediğiniz tarih
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Sağ Kolon: Sepet Özeti & İndirim Kuponu & SATIN AL (Görsel 2 Birebir) */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
              
              <div className="space-y-2 text-xs border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Sepet Toplamı :</span>
                  <span className="font-extrabold text-gray-900">{formatPrice(total)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Kupon İndirimi :</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold border-t pt-2 mt-2">
                  <span className="text-rose-500">Genel Toplam :</span>
                  <span className="text-rose-600 text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* İndirim Kodum Var Formu (Görsel 2 Birebir) */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="+ İndirim Kodum Var"
                    className="flex-1 px-3 py-2 border rounded-xl text-xs bg-gray-50 uppercase font-bold"
                  />
                  <button type="submit" className="bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs">Uygula</button>
                </div>
                {couponMsg && <p className="text-[11px] font-bold text-emerald-700">{couponMsg}</p>}
              </form>

              {/* SATIN AL Butonu (Görsel 2 Birebir) */}
              <Link
                href="/odeme"
                className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                SATIN AL &gt;
              </Link>
            </div>
          </div>

        </div>

        {/* Alt Kısım: Sepete Özel Kampanyalar (Görsel 2 Birebir) */}
        <div className="mt-12">
          <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="text-amber-500" /> Sepete Özel Kampanyalar
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {specialOffers.map((sp) => (
              <div key={sp.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <div className="relative aspect-square w-full mb-2 bg-gray-50 rounded-xl p-2">
                  <Image src={sp.images?.[0] || "/placeholder.png"} alt={sp.name} fill className="object-contain" unoptimized />
                </div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">{sp.brand}</span>
                <p className="text-xs font-bold text-gray-800 line-clamp-2 h-8">{sp.name}</p>
                <p className="text-xs font-extrabold text-emerald-600 mt-2">{formatPrice(sp.price)}</p>
                <button
                  onClick={() => useCartStore.getState().addItem(sp, 1)}
                  className="mt-3 w-full bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-600 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  Sepete Ekle
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
