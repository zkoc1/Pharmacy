"use client";
import React, { useRef } from "react";
import type { OrderRecord } from "@/stores/orderStore";
import { Printer, X, FileText } from "lucide-react";
import { formatPrice } from "@/lib/products";

interface Props {
  order: OrderRecord;
  type: "magaza_karti" | "mesafeli_satis" | "on_bilgilendirme";
  onClose: () => void;
}

export default function DocumentModal({ order, type, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${type === "magaza_karti" ? "Mağaza Kartı" : type === "mesafeli_satis" ? "Mesafeli Satış Sözleşmesi" : "Ön Bilgilendirme Formu"} - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; font-size: 12px; color: #333; line-height: 1.5; }
            h1 { font-size: 18px; border-bottom: 2px solid #ccc; padding-bottom: 10px; text-transform: uppercase; }
            h2 { font-size: 14px; margin-top: 20px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f9fafb; }
            .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 15px; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getTitle = () => {
    if (type === "magaza_karti") return "Mağaza Kartı (Paketleme Fişi)";
    if (type === "mesafeli_satis") return "Mesafeli Satış Sözleşmesi";
    return "Ön Bilgilendirme Formu";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2"><FileText size={18} className="text-emerald-600"/> {getTitle()}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs"><Printer size={14}/> Yazdır</button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto" ref={printRef}>
          {type === "magaza_karti" && (
            <div>
              <h1>MAĞAZA KARTI - PAKETLEME FİŞİ</h1>
              <div className="header-info">
                <div>
                  <strong>Sipariş No:</strong> #{order.id}<br/>
                  <strong>Tarih:</strong> {order.date}<br/>
                  <strong>Müşteri:</strong> {order.customerName}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>Fatura & Teslimat:</strong><br/>
                  {order.deliveryAddress}
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Ürün Adı</th>
                    <th>Barkod/SKU</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it: any, i: number) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td>{it.product_slug || "SKU-YOK"}</td>
                      <td>{it.quantity}</td>
                      <td>{formatPrice(it.price)}</td>
                      <td>{formatPrice(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total">
                Genel Toplam: {formatPrice(order.total)}
              </div>
            </div>
          )}

          {type === "on_bilgilendirme" && (
            <div>
              <h1>ÖN BİLGİLENDİRME FORMU</h1>
              <p><strong>1. SATICI BİLGİLERİ</strong></p>
              <p>Unvanı: OnbSağlık E-Ticaret<br/>Mersis No: 0000000000000000<br/>Adres: OnbSağlık Merkez Binası, Türkiye<br/>E-Posta: bilgi@onbsaglik.com.tr</p>
              <p><strong>2. ALICI BİLGİLERİ</strong></p>
              <p>Adı/Soyadı: {order.customerName}<br/>Teslimat Adresi: {order.deliveryAddress}</p>
              <p><strong>3. SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ</strong></p>
              <table>
                <thead>
                  <tr><th>Ürün Adı</th><th>Adet</th><th>Tutar</th></tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it: any, i: number) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td>{it.quantity}</td>
                      <td>{formatPrice(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p><strong>TOPLAM:</strong> {formatPrice(order.total)}</p>
              <p><strong>4. TESLİMAT BİLGİLERİ</strong></p>
              <p>Teslimat, Alıcı'nın yukarıda belirtilen adresine kargo firması aracılığıyla yapılacaktır.</p>
              <p>İşbu form {order.date} tarihinde elektronik ortamda onaylanmıştır.</p>
            </div>
          )}

          {type === "mesafeli_satis" && (
            <div>
              <h1>MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
              <p><strong>MADDE 1 - TARAFLAR</strong></p>
              <p>İşbu Sözleşme, Satıcı (OnbSağlık) ile Alıcı ({order.customerName}) arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde imzalanmıştır.</p>
              <p><strong>MADDE 2 - KONU</strong></p>
              <p>İşbu Sözleşme'nin konusu, Alıcı'nın Satıcı'ya ait internet sitesinden elektronik ortamda siparişini yaptığı ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
              <p><strong>MADDE 3 - SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ</strong></p>
              <ul>
                {(order.items || []).map((it: any, i: number) => (
                  <li key={i}>{it.quantity}x {it.name} - {formatPrice(it.price * it.quantity)}</li>
                ))}
              </ul>
              <p><strong>Genel Toplam:</strong> {formatPrice(order.total)}</p>
              <p><strong>MADDE 4 - GENEL HÜKÜMLER</strong></p>
              <p>4.1. Alıcı, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</p>
              <p>4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile Alıcı'nın yerleşim yerinin uzaklığına bağlı olarak kargo şirketi aracılığıyla teslim edilir.</p>
              <p><strong>MADDE 5 - CAYMA HAKKI</strong></p>
              <p>Alıcı, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 gün içinde cayma hakkına sahiptir. Dermokozmetik, kişisel bakım ve takviye edici gıda ürünlerinde cayma hakkının kullanılabilmesi için ürünün ambalajının açılmamış ve denenmemiş olması şarttır.</p>
              <p><strong>TARİH:</strong> {order.date}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
