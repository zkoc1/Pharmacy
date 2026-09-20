const fs = require('fs');
let content = fs.readFileSync('src/app/admin/siparisler/page.tsx', 'utf8');

const targetButton = \
                        <button 
                          onClick={() => setCargoLabelOrder(ord)}
                          className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[10px] py-1.5 rounded transition-colors mb-2"
                        >
                          Kargo Etiketini Yazdır
                        </button>\;

const replacedButton = \
                        {ord.status !== "İptal / İade" && (
                          <button 
                            onClick={() => setCargoLabelOrder(ord)}
                            className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[10px] py-1.5 rounded transition-colors mb-2"
                          >
                            Kargo Etiketini Yazdır
                          </button>
                        )}\;

content = content.replace(targetButton, replacedButton);
fs.writeFileSync('src/app/admin/siparisler/page.tsx', content, 'utf8');
