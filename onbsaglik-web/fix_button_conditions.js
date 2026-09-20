const fs = require('fs');
let content = fs.readFileSync('src/app/admin/siparisler/page.tsx', 'utf8');

const updatedDropdownButtons = \
                                {ord.status === "Ödeme Bekliyor" && (
                                  <button onClick={() => updateOrderStatus(ord.id, "Hazırlanıyor")} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">İşleme Al</button>
                                )}
                                {(ord.status === "Hazırlanıyor" || ord.status === "Ödeme Bekliyor") && (
                                  <button onClick={() => setCustomCarrierOrder(ord)} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Başka Kargo Firması ile Gönder</button>
                                )}
                                {ord.status !== "İptal / İade" && ord.status !== "Teslim Edildi" && (
                                  <button onClick={() => updateOrderStatus(ord.id, "İptal / İade")} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 border-b">İptal Et</button>
                                )}
                                {ord.status !== "İptal / İade" && (
                                  <button onClick={() => setDocumentOrder({order: ord, type: "magaza_karti"})} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Mağaza Kartı Yazdır</button>
                                )}
                                <button onClick={() => setDocumentOrder({order: ord, type: "mesafeli_satis"})} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Mesafeli Satış Sözleşmesi</button>
                                <button onClick={() => setDocumentOrder({order: ord, type: "on_bilgilendirme"})} className="w-full text-left px-3 py-2 hover:bg-gray-50">Ön Bilgilendirme Formu</button>
\;

content = content.replace(
  /<button onClick=\{\(\) => updateOrderStatus\(ord\.id, "Hazırlanıyor"\)\} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">İşleme Al<\/button>[\s\S]*?<button onClick=\{\(\) => setDocumentOrder\(\{order: ord, type: "on_bilgilendirme"\}\)\} className="w-full text-left px-3 py-2 hover:bg-gray-50">Ön Bilgilendirme Formu<\/button>/m,
  updatedDropdownButtons.trim()
);

fs.writeFileSync('src/app/admin/siparisler/page.tsx', content, 'utf8');
