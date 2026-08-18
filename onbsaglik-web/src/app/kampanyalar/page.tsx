/**
 * Kampanyalar ve Özel Fırsatlar Sayfası — /kampanyalar rotası.
 * OnbSağlık canlı combo teklifler, flash fırsatlar ve stok kontrollü indirimli paketler.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Gift, Tag, ShoppingCart, ArrowRight, ShieldCheck, Clock, Check } from "lucide-react";
import { useCampaignStore, Campaign } from "@/stores/campaignStore";
import { useCartStore } from "@/stores/cartStore";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";

export default function KampanyalarSayfasi() {
  const { getActiveCampaigns } = useCampaignStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const activeCampaigns = getActiveCampaigns();

  useEffect(() => {
    import("@/data/products.json").then((m) => setProducts(m.default as Product[]));
  }, []);

  const handleAddComboToCart = (camp: Campaign, isOutOfStock: boolean) => {
    if (isOutOfStock) return;
    const mainProd = products.find((p) => p.id === camp.productId);
    const comboProd = products.find((p) => p.id === camp.comboProductId);

    if (mainProd && mainProd.stock > 0) addItem(mainProd, 1);
    if (comboProd && comboProd.stock > 0) {
      const discountedComboProd = {
        ...comboProd,
        price: camp.comboPrice ? camp.comboPrice : comboProd.price,
      };
      addItem(discountedComboProd, 1);
    }

    setAddedItems((prev) => ({ ...prev, [camp.id]: true }));
    setTimeout(() => setAddedItems((prev) => ({ ...prev, [camp.id]: false })), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-custom">
        {/* Üst Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-4">
              <Zap size={14} className="text-amber-400 fill-amber-400" /> OnbSağlık Fırsat Kulübü
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Özel Kampanyalar & <br />
              <span className="text-amber-400">Combo Paket Fırsatları</span>
            </h1>
            <p className="text-emerald-100 text-base md:text-lg mb-6">
              1 alana 2. üründe özel indirimler, günün flash fırsatları ve orijinal ürün garantili dermokozmetik kampanyaları!
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Aktif Kampanya Kartları Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Gift className="text-emerald-600" size={28} /> Güncel Kampanya ve Fırsatlar
        </h2>

        {activeCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Zap size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">Şu anda aktif özel kampanya bulunmuyor</h3>
            <p className="text-sm text-gray-500 mt-1">Yeni fırsatlar için bu sayfayı takip etmeye devam edin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeCampaigns.map((camp) => {
              const mainProd = products.find((p) => p.id === camp.productId);
              const comboProd = products.find((p) => p.id === camp.comboProductId);

              const isMainOutOfStock = mainProd ? mainProd.stock === 0 : false;
              const isComboOutOfStock = comboProd ? comboProd.stock === 0 : false;
              const isOutOfStock = isMainOutOfStock || isComboOutOfStock;

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Başlık Bandı */}
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-white flex items-center justify-between">
                    <span className="font-extrabold text-sm flex items-center gap-2">
                      <Zap size={16} className="fill-white" /> {camp.bannerTitle || "Özel Combo Teklif"}
                    </span>
                    {camp.endsAt && (
                      <span className="text-xs font-semibold bg-black/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} /> Bitiş: {new Date(camp.endsAt).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Teklif Metni */}
                    {camp.comboDescription && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-amber-900 text-xs md:text-sm font-bold flex items-center gap-2">
                        <Gift className="text-amber-600 flex-shrink-0" size={18} />
                        {camp.comboDescription}
                      </div>
                    )}

                    {/* COMBO ÜRÜNLERİ GÖRSEL VE BİLGİ İKİLİSİ */}
                    {camp.type === "combo" && mainProd && comboProd ? (
                      <div className="grid grid-cols-2 gap-4 items-center mb-6">
                        {/* 1. Ana Ürün */}
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center relative group">
                          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                            1. Ürün
                          </span>
                          {isMainOutOfStock && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                              Stokta Yok
                            </span>
                          )}
                          <div className="relative aspect-square w-full mb-2">
                            <Image
                              src={mainProd.images?.[0] || "/placeholder.png"}
                              alt={mainProd.name}
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-500 block uppercase">
                            {mainProd.brand}
                          </span>
                          <p className="text-xs font-bold text-gray-800 line-clamp-2 mt-1">
                            {mainProd.name}
                          </p>
                          <p className="text-sm font-extrabold text-emerald-600 mt-2">
                            {formatPrice(mainProd.price)}
                          </p>
                        </div>

                        {/* 2. Ürün */}
                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 text-center relative group">
                          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                            2. Ürün (Fırsat)
                          </span>
                          {isComboOutOfStock && (
                            <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                              Stokta Yok
                            </span>
                          )}
                          <div className="relative aspect-square w-full mb-2">
                            <Image
                              src={comboProd.images?.[0] || "/placeholder.png"}
                              alt={comboProd.name}
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-amber-700 block uppercase">
                            {comboProd.brand}
                          </span>
                          <p className="text-xs font-bold text-gray-800 line-clamp-2 mt-1">
                            {comboProd.name}
                          </p>
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(comboProd.price)}
                            </span>
                            <span className="text-sm font-extrabold text-red-600">
                              {camp.comboPrice ? formatPrice(camp.comboPrice) : formatPrice(comboProd.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      mainProd && (
                        <div className="flex gap-4 items-center mb-6 bg-gray-50 p-4 rounded-2xl">
                          <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-xl p-2 border border-gray-100">
                            <Image
                              src={mainProd.images?.[0] || "/placeholder.png"}
                              alt={mainProd.name}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">{mainProd.brand}</span>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{mainProd.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              {mainProd.marketPrice > mainProd.price && (
                                <span className="text-xs text-gray-400 line-through">{formatPrice(mainProd.marketPrice)}</span>
                              )}
                              <span className="text-base font-extrabold text-emerald-600">
                                {camp.discountedPrice ? formatPrice(camp.discountedPrice) : formatPrice(mainProd.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* Stok Kontrollü Alt Buton */}
                    <button
                      onClick={() => handleAddComboToCart(camp, isOutOfStock)}
                      disabled={isOutOfStock}
                      className={`w-full font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm ${
                        isOutOfStock
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
                          : addedItems[camp.id]
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isOutOfStock ? (
                        "Stokta Yok - Kampanya Tükendi"
                      ) : addedItems[camp.id] ? (
                        <>
                          <Check size={18} /> İki Ürün Sepete Eklendi!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} /> Birlikte Sepete Ekle & Fırsatı Yakala
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
