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

  const barcodeData = order.trackingNumber || `272${Math.floor(1000000000 + Math.random() * 9000000000)}`;

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
            @page { size: A5 portrait; margin: 0; }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              margin: 0; padding: 0; background: #fff; color: #000;
              width: 148mm; height: 210mm; /* A5 Format */
              box-sizing: border-box;
            }
            .a5-container { 
              width: 100%; height: 100%; padding: 15mm; box-sizing: border-box; 
              display: flex; flex-direction: column; border: 1px solid #000;
            }
            
            /* Top Section: Logos & Barcode */
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .brand { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin: 0; }
            .carrier { font-size: 20px; font-weight: bold; text-transform: uppercase; }
            .barcode-container { text-align: center; margin-top: 10px; }
            .barcode-img { height: 60px; max-width: 100%; }
            .tracking-text { font-size: 16px; font-weight: bold; margin-top: 5px; letter-spacing: 2px; }

            /* Middle Section: Addresses */
            .address-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
            .address-box { border: 2px solid #000; padding: 10px; border-radius: 4px; }
            .box-title { font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 8px; color: #333; }
            .address-content { font-size: 14px; line-height: 1.4; }
            .address-content strong { font-size: 16px; display: block; margin-bottom: 4px; }

            /* Bottom Section: Order Details */
            .order-details { flex-grow: 1; border: 2px solid #000; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
            .item-row { display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed #ccc; padding: 6px 0; }
            .item-row:last-child { border-bottom: none; }
            .item-name { width: 70%; font-weight: bold; }
            .item-qty { width: 30%; text-align: right; }

            /* Footer */
            .footer { text-align: center; font-size: 10px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }

            /* Hide buttons when printing */
            @media print {
              body { margin: 0; padding: 0; }
              .a5-container { border: none; }
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
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 p-4 sm:p-8 overflow-y-auto pt-12 pb-12">
      <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col relative mt-10 mb-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-bold text-gray-800">Kargo Etiketi (A5 Formatı)</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md transition-all">
              <Printer size={16} /> A5 Yazdır
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Body / Print Preview Area */}
        <div className="p-4 sm:p-8 flex justify-center items-start">
          
          {/* A5 Container Preview (Scaled down visually to fit screen better without scrolling horizontally) */}
          <div style={{ transform: "scale(0.85)", transformOrigin: "top center", marginBottom: "-15%" }}>
            <div ref={printRef} className="bg-white shadow-xl" style={{ width: "148mm", minHeight: "210mm", padding: "15mm", boxSizing: "border-box", display: "flex", flexDirection: "column", border: "1px solid #000" }}>
            
            {/* Header */}
            <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "15px" }}>
              <div>
                <h1 className="brand" style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", margin: 0 }}>onb<span style={{ color: "#333" }}>sağlık</span></h1>
                <div style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>www.onbsaglik.com.tr</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="carrier" style={{ fontSize: "20px", fontWeight: "bold", textTransform: "uppercase" }}>{order.carrier}</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>Sipariş No: {order.id}</div>
              </div>
            </div>

            {/* Main Barcode */}
            <div className="barcode-container" style={{ textAlign: "center", marginBottom: "15px" }}>
              {/* TEC-IT Barcode API for real barcodes */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://barcode.tec-it.com/barcode.ashx?data=${barcodeData}&code=Code128&dpi=96`} alt="Barcode" style={{ height: "70px", maxWidth: "100%" }} />
              <div className="tracking-text" style={{ fontSize: "18px", fontWeight: "bold", marginTop: "5px", letterSpacing: "2px" }}>{barcodeData}</div>
            </div>

            {/* Addresses */}
            <div className="address-grid" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
              <div className="address-box" style={{ border: "2px solid #000", padding: "10px", borderRadius: "4px" }}>
                <div className="box-title" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "8px" }}>ALICI BİLGİLERİ</div>
                <div className="address-content" style={{ fontSize: "14px", lineHeight: 1.4 }}>
                  <strong style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>{order.customerName}</strong>
                  <div>{order.deliveryAddress}</div>
                  <div style={{ marginTop: "4px", fontWeight: "bold" }}>Tel: {order.customerPhone || "Müşteri paneline kayıtlı"}</div>
                </div>
              </div>

              <div className="address-box" style={{ border: "1px solid #666", padding: "8px", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
                <div className="box-title" style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "4px", color: "#666" }}>GÖNDERİCİ BİLGİLERİ</div>
                <div className="address-content" style={{ fontSize: "12px", lineHeight: 1.3, color: "#333" }}>
                  <strong>OnbSağlık E-Ticaret</strong>
                  <div>Kayseri / Kocasinan / Yeni Mah. - Yeni Mahalle 12. Cadde Toktay Apartmanı No:95/4 Kocasinan Kayseri</div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="order-details" style={{ flexGrow: 1, border: "2px solid #000", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>
              <div className="box-title" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "8px" }}>İÇERİK ({order.items.reduce((acc, item) => acc + item.quantity, 0)} Parça)</div>
              {order.items.map((item, idx) => (
                <div className="item-row" key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderBottom: "1px dashed #ccc", padding: "6px 0" }}>
                  <div className="item-name" style={{ width: "75%", fontWeight: "bold" }}>{item.name}</div>
                  <div className="item-qty" style={{ width: "25%", textAlign: "right", fontWeight: "bold", fontSize: "14px" }}>{item.quantity} Adet</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="footer" style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold", borderTop: "2px solid #000", paddingTop: "10px" }}>
              DİKKAT KIRILACAK EŞYA - LÜTFEN ÖZENLE TAŞIYINIZ
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
