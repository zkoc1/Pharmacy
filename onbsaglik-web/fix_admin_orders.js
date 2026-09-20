const fs = require('fs');
let content = fs.readFileSync('src/app/admin/siparisler/page.tsx', 'utf8');

// Update Dropdown Buttons
const dropdownButtons = 
                                <button onClick={() => updateOrderStatus(ord.id, "Hazırlanıyor")} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">İşleme Al</button>
                                <button onClick={() => updateOrderStatus(ord.id, "Kargoda")} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Başka Kargo Firması ile Gönder</button>
                                <button onClick={() => updateOrderStatus(ord.id, "İptal / İade")} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 border-b">İptal Et</button>
                                <button className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Mağaza Kartı Yazdır</button>
                                <button className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Mesafeli Satış Sözleşmesi</button>
                                <button className="w-full text-left px-3 py-2 hover:bg-gray-50">Ön Bilgilendirme Formu</button>
;

content = content.replace(
  /\{ord\.status === "Ödeme Bekliyor" && \([\s\S]*?<button className="w-full text-left px-3 py-2 hover:bg-gray-50">Ön Bilgilendirme Formu<\/button>/m,
  dropdownButtons
);

fs.writeFileSync('src/app/admin/siparisler/page.tsx', content, 'utf8');
