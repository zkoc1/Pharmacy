"use client";

import React, { useState } from "react";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

export default function ProductTabs({ product }: Props) {
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "usage" | "warnings">("description");

  const tabs = [
    { id: "description", label: "Ürün Açıklaması", content: product.longDescription || product.description },
    { id: "ingredients", label: "İçindekiler / Özellikler", content: product.ingredients },
    { id: "usage", label: "Kullanım Şekli", content: product.usage },
    { id: "warnings", label: "Uyarılar", content: product.warnings },
  ].filter((t) => t.content);

  // If no detailed content is available, fallback to basic info
  if (tabs.length === 0) {
    return (
      <div className="card mt-8" style={{ padding: "32px" }}>
        <h2 className="text-xl font-bold mb-4">Ürün Bilgileri</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", color: "var(--color-text-muted)", fontSize: "14px" }}>
          {product.brand && (
            <div><span className="font-semibold" style={{ color: "var(--color-text)" }}>Marka: </span>{product.brand}</div>
          )}
          {product.barcode && (
            <div><span className="font-semibold" style={{ color: "var(--color-text)" }}>Barkod: </span>{product.barcode}</div>
          )}
          <div><span className="font-semibold" style={{ color: "var(--color-text)" }}>Stok Durumu: </span>{product.stock > 0 ? "Stokta Var" : "Stokta Yok"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mt-8 overflow-hidden">
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-xs font-extrabold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 text-sm text-gray-700 leading-relaxed font-medium">
        <div 
          className="prose prose-sm max-w-none prose-emerald"
          dangerouslySetInnerHTML={{ __html: tabs.find((t) => t.id === activeTab)?.content || "" }} 
        />

        {/* Temel Bilgiler (Marka, Barkod vb.) Description tab'inin sonunda gösterilir */}
        {activeTab === "description" && (
          <div className="mt-8 pt-6 border-t border-gray-100 grid gap-4 grid-cols-2 md:grid-cols-4 text-xs">
            {product.brand && (
              <div><span className="font-bold text-gray-400 block mb-1">Marka</span><span className="font-extrabold text-gray-900">{product.brand}</span></div>
            )}
            {product.barcode && (
              <div><span className="font-bold text-gray-400 block mb-1">Barkod</span><span className="font-extrabold text-gray-900">{product.barcode}</span></div>
            )}
            <div><span className="font-bold text-gray-400 block mb-1">KDV Oranı</span><span className="font-extrabold text-gray-900">%{product.vatRate}</span></div>
            <div>
              <span className="font-bold text-gray-400 block mb-1">Stok Durumu</span>
              <span className={`font-extrabold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{product.stock > 0 ? "Stokta Var" : "Stokta Yok"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
