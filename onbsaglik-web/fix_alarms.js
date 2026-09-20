const fs = require('fs');
let content = fs.readFileSync('src/components/product/ProductDetailClient.tsx', 'utf8');

content = content.replace('alert("Fiyat alarmı kuruldu!");', 'setAlarmMessage("Fiyat alarmı başarıyla kuruldu! (Hesabım sayfasından görebilirsiniz)"); setTimeout(() => setAlarmMessage(""), 5000);');
content = content.replace('alert("Stok alarmı kuruldu!");', 'setAlarmMessage("Stok alarmı başarıyla kuruldu! (Hesabım sayfasından görebilirsiniz)"); setTimeout(() => setAlarmMessage(""), 5000);');

fs.writeFileSync('src/components/product/ProductDetailClient.tsx', content, 'utf8');
