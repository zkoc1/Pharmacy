"use client";

import React from "react";
import type { OrderRecord } from "@/stores/orderStore";
import { X, Copy, Check } from "lucide-react";

interface Props {
  order: OrderRecord;
  onClose: () => void;
}

export default function BillingInfoModal({ order, onClose }: Props) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-bold text-gray-800">Fatura Bilgileri</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-sm text-gray-700 space-y-6">
          {/* Teslimat Adresi */}
          <div>
            <h3 className="font-bold text-[#f27a1a] mb-3 text-xs uppercase tracking-wide">Teslimat Adresi</h3>
            <div className="grid grid-cols-[130px_1fr] gap-2 items-start">
              <span className="font-semibold text-gray-500">Ad-Soyad:</span>
              <div className="flex items-center gap-2">
                <span>{order.customerName}</span>
                <button onClick={() => copyToClipboard(order.customerName, 'name1')} className="text-blue-400 hover:text-blue-600">
                  {copied === 'name1' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>

              <span className="font-semibold text-gray-500">Adres:</span>
              <div className="flex items-start gap-2">
                <span className="leading-relaxed">{order.deliveryAddress}</span>
                <button onClick={() => copyToClipboard(order.deliveryAddress, 'addr1')} className="text-blue-400 hover:text-blue-600 mt-0.5">
                  {copied === 'addr1' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Fatura Adresi */}
          <div>
            <h3 className="font-bold text-[#f27a1a] mb-3 text-xs uppercase tracking-wide">Fatura Adresi</h3>
            <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
              <span className="font-semibold text-gray-500">Ad-Soyad / Ünvan:</span>
              <div className="flex items-center gap-2">
                <span>{order.customerName}</span>
                <button onClick={() => copyToClipboard(order.customerName, 'name2')} className="text-blue-400 hover:text-blue-600">
                  {copied === 'name2' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>

              <span className="font-semibold text-gray-500 self-start mt-1">Adres:</span>
              <div className="flex items-start gap-2">
                <span className="leading-relaxed">{order.billingAddress || order.deliveryAddress}</span>
                <button onClick={() => copyToClipboard(order.billingAddress || order.deliveryAddress, 'addr2')} className="text-blue-400 hover:text-blue-600 mt-1">
                  {copied === 'addr2' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>

              <span className="font-semibold text-gray-500">E-Fatura Mükellefi:</span>
              <span>Hayır</span>

              <span className="font-semibold text-gray-500">E-Posta Adresi:</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">{order.customerEmail}</span>
                <button onClick={() => copyToClipboard(order.customerEmail, 'email')} className="text-blue-400 hover:text-blue-600">
                  {copied === 'email' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>

              <span className="font-semibold text-gray-500">Telefon Numarası:</span>
              <div className="flex items-center gap-2">
                <span>{order.customerPhone || "-"}</span>
                <button onClick={() => copyToClipboard(order.customerPhone || "", 'phone')} className="text-blue-400 hover:text-blue-600">
                  {copied === 'phone' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>

              <span className="font-semibold text-gray-500">Ödeme Yöntemi:</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          {/* Bilgi Kutusu */}
          <div className="bg-[#f0f7ff] border border-[#bce0fd] text-[#0066cc] rounded-lg p-4 text-xs leading-relaxed">
            Faturanızı <strong>"Fatura İşlemleri"</strong> altındaki <strong>"Fatura Oluştur"</strong> alanına pdf, jpeg, jpg, png dosya türlerinde yükleyerek otomatik olarak müşteriye gönderebilir ya da yukarıdaki e-posta adresini kopyalayıp iletebilirsiniz. Entegratörle çalışıyorsanız <u>entegrasyon linkine</u> faturanızı besleyebilirsiniz.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-10 py-2.5 border border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-100 transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={() => window.print()}
            className="px-10 py-2.5 bg-[#f27a1a] text-white font-bold rounded hover:bg-[#e06912] transition-colors"
          >
            Yazdır
          </button>
        </div>
      </div>
    </div>
  );
}
