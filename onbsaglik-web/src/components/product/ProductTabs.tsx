"use client";

import React, { useState, useRef } from "react";
import type { Product } from "@/types";
import ProductReviews from "./ProductReviews";
import ProductQuestions from "./ProductQuestions";

interface Props {
  product: Product;
}

export default function ProductTabs({ product }: Props) {
  const [activeTab, setActiveTab] = useState<"features" | "description" | "reviews" | "questions" | "recommend" | "returns" | "callme">("features");

  // Scroll için referanslar
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "features", label: "Ürün Özellikleri" },
    { id: "description", label: "Ürün Açıklaması" },
    { id: "reviews", label: "Kullanıcı Yorumları" }, // Sayıyı apiden alabilirsek güzel olur, ama şimdilik statik text
    { id: "questions", label: "Soru ve Cevap" },
    { id: "recommend", label: "Tavsiye Et" },
    { id: "returns", label: "İade Koşulları" },
    { id: "callme", label: "Beni Ara" },
  ] as const;

  const scrollToContainer = () => {
    if (containerRef.current) {
      const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleTabChange = (id: any) => {
    setActiveTab(id);
    if (id === "recommend") {
      alert("Tavsiye linki kopyalandı!");
      return;
    }
    if (id === "callme") {
      alert("Müşteri hizmetleri iletişim talebiniz alındı. Sizi en kısa sürede arayacağız.");
      return;
    }
    scrollToContainer();
  };

  return (
    <div className="mt-12 mb-20" ref={containerRef}>
      {/* TABS HEADER - Pill Style like Screenshot 4 */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all border ${
                isActive
                  ? "border-pink-500 text-pink-500 bg-white" // Pink outline for active
                  : "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200" // Gray pill for inactive
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
        
        {activeTab === "features" && (
          <div className="text-sm text-gray-700 leading-relaxed font-medium">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Öne Çıkan Özellikler / İçindekiler</h3>
            {product.ingredients ? (
              <div 
                className="prose prose-sm max-w-none prose-pink"
                dangerouslySetInnerHTML={{ __html: product.ingredients.replace(/\n/g, '<br/>') }} 
              />
            ) : (
              <p className="text-gray-500 italic">Bu ürün için özellik bilgisi girilmemiştir.</p>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-100 grid gap-4 grid-cols-2 md:grid-cols-4 text-xs">
              {product.brand && (
                <div><span className="font-bold text-gray-400 block mb-1">Marka</span><span className="font-extrabold text-gray-900">{product.brand}</span></div>
              )}
              {product.barcode && (
                <div><span className="font-bold text-gray-400 block mb-1">Barkod</span><span className="font-extrabold text-gray-900">{product.barcode}</span></div>
              )}
              <div><span className="font-bold text-gray-400 block mb-1">Stok Durumu</span><span className={`font-extrabold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{product.stock > 0 ? "Stokta Var" : "Stokta Yok"}</span></div>
            </div>
          </div>
        )}

        {activeTab === "description" && (
          <div className="text-sm text-gray-700 leading-relaxed font-medium">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Ürün Açıklaması</h3>
            {product.longDescription || product.description ? (
              <div 
                className="prose prose-sm max-w-none prose-pink"
                dangerouslySetInnerHTML={{ __html: (product.longDescription || product.description || "").replace(/\n/g, '<br/>') }} 
              />
            ) : (
              <p className="text-gray-500 italic">Bu ürün için açıklama girilmemiştir.</p>
            )}
          </div>
        )}

        {activeTab === "returns" && (
          <div className="text-sm text-gray-700 leading-relaxed font-medium">
            <h3 className="text-lg font-bold mb-4 text-slate-800">İade Koşulları</h3>
            <p>
              Satın aldığınız ürünleri teslimat tarihinden itibaren 14 gün içerisinde iade edebilirsiniz. 
              İade edilecek ürünün orijinal kutusunda, ambalajı açılmamış, kullanılmamış ve hasar görmemiş olması gerekmektedir.
              <br/><br/>
              Kozmetik ve kişisel bakım ürünlerinde iade, ancak ambalajı açılmamış ve denenmemiş olması şartıyla kabul edilmektedir.
              İade kargo masrafları firmamıza aittir. Detaylı bilgi için Müşteri Hizmetleri ile iletişime geçebilirsiniz.
            </p>
          </div>
        )}

        {/* Yorumlar ve Sorular Component İçeriği Tab'in dışına taşıyacağız ya da burada göstereceğiz */}
      </div>

      {activeTab === "reviews" && (
        <ProductReviews productSlug={product.slug} productId={product.id} />
      )}

      {activeTab === "questions" && (
        <ProductQuestions productId={product.id} />
      )}

    </div>
  );
}
