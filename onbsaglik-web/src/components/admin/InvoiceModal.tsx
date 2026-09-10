"use client";

import React from "react";
import type { OrderRecord } from "@/stores/orderStore";
import { X, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/products";

interface Props {
  order: OrderRecord;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

export default function InvoiceModal({ order, onClose, onInvoiceCreated }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Fatura Oluştur</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Uyarı Kutusu */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3 text-sm text-orange-800">
            <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="mb-2">
                Faturanız <strong>EDM fatura sağlayıcısı</strong> ile kesilecektir. Tercihinizi değiştirmek için e-Dönüşüm sayfasından "Tercih Edilen Sağlayıcı" değişikliği yapabilirsiniz.
              </p>
              <p>
                Fatura üzerinde <strong>değişiklik yapmak, işçilik bilgisi, muafiyet bilgisi</strong> girmek için fatura detaylarını düzenleyebilirsiniz.
              </p>
            </div>
            <div className="ml-auto">
              <button className="text-orange-600 underline font-bold whitespace-nowrap">Detayları Düzenle</button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4 font-medium">
            Aşağıdaki bilgilerle fatura oluşturmak için <strong className="text-orange-600">Hızlı Fatura Oluştur</strong> butonu ile ilerleyebilirsiniz.
          </p>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b">
                <tr>
                  <th className="p-4 w-2/5">Ürün Bilgisi</th>
                  <th className="p-4">Kdv Oranı</th>
                  <th className="p-4">Kdv Tutarı</th>
                  <th className="p-4 text-center">Miktar</th>
                  <th className="p-4 text-right">Birim Fiyatı</th>
                  <th className="p-4 text-right">Toplam Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item, idx) => {
                  const kdvRate = 0.01; // %1 Kdv varsayalım
                  const priceWithoutKdv = item.price / (1 + kdvRate);
                  const kdvAmount = item.price - priceWithoutKdv;
                  const total = item.price * item.quantity;
                  
                  return (
                    <tr key={idx}>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 mb-1">{item.name}</div>
                        <div className="text-[10px] text-gray-500">{item.id}, one size</div>
                      </td>
                      <td className="p-4">
                        <select className="border rounded p-1.5 text-xs bg-white text-gray-700">
                          <option>%1</option>
                          <option>%10</option>
                          <option>%20</option>
                        </select>
                      </td>
                      <td className="p-4 text-gray-700">{kdvAmount.toFixed(2)} ₺</td>
                      <td className="p-4 text-center text-gray-700">{item.quantity} Adet</td>
                      <td className="p-4 text-right text-gray-700">{priceWithoutKdv.toFixed(2)} ₺</td>
                      <td className="p-4 text-right font-bold text-gray-800">{formatPrice(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onInvoiceCreated}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Hızlı Fatura Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
