const fs = require('fs');

let pageContent = fs.readFileSync('src/app/hesabim/siparislerim/page.tsx', 'utf8');

// Insert useState for modal
if (!pageContent.includes('const [cancelOrderId, setCancelOrderId]')) {
  pageContent = pageContent.replace('const { orders, fetchUserOrders } = useOrderStore();', 
    'const { orders, fetchUserOrders } = useOrderStore();\n  const [cancelOrderId, setCancelOrderId] = React.useState<string | null>(null);\n  const [isCancelling, setIsCancelling] = React.useState(false);\n\n  const handleCancel = async (id: string) => {\n    setIsCancelling(true);\n    try {\n      const res = await fetch("/api/user/orders/cancel", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ orderId: id })\n      });\n      const data = await res.json();\n      if (data.success) {\n        alert("Sipariş başarıyla iptal edildi ve iptal süreci başlatıldı.");\n        fetchUserOrders();\n      } else {\n        alert(data.error || "İptal işlemi başarısız.");\n      }\n    } catch (e) {\n      alert("Sistemsel bir hata oluştu.");\n    }\n    setIsCancelling(false);\n    setCancelOrderId(null);\n  };');
}

// Render Cancel Button if applicable
if (!pageContent.includes('Siparişi İptal Et')) {
  const cancelBtnHtml = 
                  {/* İptal Butonu ve Toplam Tutar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 pt-3 gap-3">
                    { ["Ödeme Bekliyor", "Hazırlanıyor", "PayTR Ödeme Bekliyor", "Mail Order Bekliyor"].includes(ord.status) ? (
                      <button 
                        onClick={() => setCancelOrderId(ord.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={16} /> Siparişi İptal Et
                      </button>
                    ) : (
                      <div className="w-full sm:w-auto text-[10px] text-gray-400 font-medium">
                        (Bu sipariş iptal edilemez)
                      </div>
                    )}
                    <div className="flex justify-between items-center w-full sm:w-auto gap-3">
                      <span className="text-xs text-gray-500 font-semibold">
                        Ödenen Genel Toplam
                      </span>
                      <span className="text-base font-extrabold text-rose-600">
                        {formatPrice(ord.total)}
                      </span>
                    </div>
                  </div>
;
  
  pageContent = pageContent.replace(/\{\/\* Toplam Tutar \*\/\}[\s\S]*?<\/div>/m, cancelBtnHtml);
}

// Add Modal to the bottom
if (!pageContent.includes('Siparişi iptal etmek istediğinize emin misiniz?')) {
  const modalHtml = 
      {/* İptal Onay Modalı */}
      {cancelOrderId && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <XCircle size={48} className="mx-auto text-rose-500 mb-4" />
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">Siparişi İptal Et</h3>
            <p className="text-sm text-gray-500 mb-6">
              Siparişi iptal etmek istediğinize emin misiniz? Ücret iadeniz otomatik olarak başlatılacaktır.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCancelOrderId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-xs"
                disabled={isCancelling}
              >
                Vazgeç
              </button>
              <button 
                onClick={() => handleCancel(cancelOrderId)}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-2"
                disabled={isCancelling}
              >
                {isCancelling ? "İşleniyor..." : "Evet, İptal Et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
;
  pageContent = pageContent.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/m, modalHtml);
}

fs.writeFileSync('src/app/hesabim/siparislerim/page.tsx', pageContent, 'utf8');
