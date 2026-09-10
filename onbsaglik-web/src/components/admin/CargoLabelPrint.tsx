"use client";

import React, { useRef } from "react";
import type { OrderRecord } from "@/stores/orderStore";
import { Printer, X } from "lucide-react";

interface Props {
  order: OrderRecord;
  onClose: () => void;
}

export default function CargoLabelPrint({ order, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Kargo Etiketi - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            .label-container { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .warning-box { background: #f9f9f9; border: 1px solid #ccc; padding: 10px; font-size: 12px; text-align: center; margin-bottom: 20px; font-weight: bold; border-radius: 4px; }
            .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .header-logos h1 { margin: 0; font-size: 32px; color: #f27a1a; }
            .grid-2 { display: flex; gap: 20px; margin-bottom: 20px; }
            .box { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 6px; }
            .box-title { font-weight: bold; margin-bottom: 15px; color: #555; }
            .row { display: flex; margin-bottom: 8px; font-size: 14px; }
            .row-label { width: 100px; font-weight: bold; }
            .barcode-area { text-align: center; }
            .barcode-box { display: inline-block; width: 100%; height: 60px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px); margin-bottom: 10px; }
            .products-box { border: 1px solid #ddd; padding: 15px; border-radius: 6px; }
            .product-row { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .product-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .qty-circle { width: 30px; height: 30px; border: 1px solid #999; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; }
            .product-info { flex: 1; font-size: 12px; }
            .product-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
            .product-meta { display: flex; gap: 20px; color: #666; }
            
            @media print {
              body { padding: 0; }
              .label-container { border: none; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Kargo Etiketini A4 Yazdır</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
              <Printer size={16} /> Yazdır
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Print Area */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 flex justify-center">
          
          <div ref={printRef} className="bg-white w-full max-w-[800px] p-8 border rounded-lg shadow-sm">
            {/* Warning Box */}
            <div className="warning-box">
              ⚠️ Kargo şirketinin dikkatine, bu bir onbsaglik.com gönderisidir. İlgili anlaşmasına uygun işlem yapabilirsiniz.
            </div>

            {/* Header */}
            <div className="header-logos">
              <h1 style={{ fontWeight: 900, fontSize: "28px", color: "#10b981", margin: 0, letterSpacing: "-1px" }}>
                onb<span style={{ color: "#333" }}>sağlık</span>
              </h1>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#666" }}>
                {order.carrier === "PTT Kargo" ? "PTT Kargo" : order.carrier}
              </div>
            </div>

            {/* Grid 2 */}
            <div className="grid-2">
              <div className="box">
                <div className="box-title">Alıcı Bilgileri</div>
                <div className="row">
                  <div className="row-label">Sipariş No</div>
                  <div>: {order.id}</div>
                </div>
                <div className="row">
                  <div className="row-label">Ad-Soyad</div>
                  <div>: {order.customerName}</div>
                </div>
                <div className="row">
                  <div className="row-label">Adres</div>
                  <div>: {order.deliveryAddress}</div>
                </div>
              </div>

              <div className="box barcode-area">
                <div className="box-title" style={{ textAlign: "left" }}>Kargo Barkodu</div>
                <div className="barcode-box"></div>
                <div style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "2px" }}>
                  {order.trackingNumber || Math.floor(1000000000000 + Math.random() * 9000000000000)}
                </div>
              </div>
            </div>

            {/* Products Box */}
            <div className="products-box">
              <div className="box-title">Ürün Bilgileri</div>
              {order.items.map((item, idx) => (
                <div className="product-row" key={idx}>
                  <div className="qty-circle">{item.quantity}</div>
                  <div className="product-info">
                    <div className="product-name">{item.name}</div>
                    <div className="product-meta">
                      <div><span style={{color: '#999'}}>Adet:</span> {item.quantity} Adet</div>
                      <div><span style={{color: '#999'}}>Barkod:</span> {item.id}</div>
                      <div><span style={{color: '#999'}}>Stok Kodu:</span> ONB-{item.id}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
