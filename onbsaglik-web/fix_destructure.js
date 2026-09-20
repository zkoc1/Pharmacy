const fs = require('fs');
let content = fs.readFileSync('src/app/admin/siparisler/page.tsx', 'utf8');
content = content.replace(
  'updateCarrier,',
  'updateCarrier,\n    updateTrackingNumber,'
);
fs.writeFileSync('src/app/admin/siparisler/page.tsx', content, 'utf8');
